import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { OrderItem } from './entities/order-item.entity';
import { PaymentStatus, Status } from '../../common/enums/status.enum';
import { setTimeout as sleep } from 'node:timers/promises';
import { Race } from '../../common/entities/race.entity';
import { RedisService } from '../redis/redis.service';
import { CACHE_OPTIONS } from '../../common/constants/cache.constant';
import { User } from '../users/entities/user.entity';
import { randomUUID } from 'node:crypto';
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,

    @InjectRepository(Race)
    private readonly raceRepo: Repository<Race>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    // TRANSACTION BẮT ĐẦU
    const savedOrder = await this.dataSource.transaction(async (manager) => {
      // 1. Check user
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) throw new BadRequestException('Vui lòng đăng nhập!');

      // 2. Validate unique
      const ids = dto.items.map((i) => i.productVariantId);
      if (new Set(ids).size !== ids.length) {
        throw new BadRequestException('Danh sách bị trùng');
      }

      // 3. Sort
      //phải sắp xếp để tránh deadlock do có thể 2 transaction cùng đợi nhau
      const variantIds = [...ids].sort();

      // 4. Query + lock
      const variants = await manager
        .createQueryBuilder(ProductVariant, 'variant')
        .leftJoinAndSelect('variant.product', 'product')
        .where('variant.id IN (:...ids)', { ids: variantIds })
        .setLock('pessimistic_write', undefined, ['variant']) // ← chỉ lock variant
        .getMany();

      // variants đã có product sẵn, không cần query riêng
      const variantMap = new Map(variants.map((v) => [v.id, v]));

      // 5. Duyệt items
      let subtotal = 0;
      const orderItems: OrderItem[] = [];

      for (const item of dto.items) {
        const variant = variantMap.get(item.productVariantId);
        if (!variant) throw new NotFoundException('Variant không tồn tại');
        if (variant.stock < item.quantity) {
          throw new BadRequestException(
            `${variant.product.name} không đủ hàng`,
          );
        }

        variant.stock -= item.quantity;
        await manager.save(variant);

        const itemTotal = Number(variant.price) * item.quantity;
        subtotal += itemTotal;

        orderItems.push(
          manager.create(OrderItem, {
            productVariantId: variant.id,
            productName: variant.product.name,
            price: variant.price,
            quantity: item.quantity,
            totalPrice: itemTotal,
          }),
        );
      }

      // 6. Tạo order
      const order = manager.create(Order, {
        code: `ORD-${randomUUID()}`,
        status: Status.PENDING,
        userId,
        subtotal,
        shippingFee: 30000,
        totalAmount: subtotal + 30000,
        shippingAddress: {
          receiverName: user.firstName + ' ' + user.lastName,
          phone: user.phone,
          address: user.address,
        },
        orderItem: orderItems,
      });

      return manager.save(order);
    });
    // TRANSACTION KẾT THÚC (commit)

    // 7. Xóa giỏ Redis (ngoài transaction)
    const variantIds = dto.items.map((i) => i.productVariantId);
    if (variantIds.length) {
      await this.redisService.hdel(`cart:${userId}`, ...variantIds); //...trải mảng ra xóa hết những id có trong redis
    }

    return savedOrder;
  }

  async addShoppingCart(
    userId: string,
    variantId: string,
    quantity: string,
    res: any,
  ) {
    const cartKey = `cart:${userId}`;
    const cartItem = await this.redisService.hget(cartKey, variantId);
    if (cartItem) {
      await this.redisService.hincrby(cartKey, variantId, Number(quantity));
    } else {
      await this.redisService.hset(cartKey, variantId, quantity);
      await this.redisService.expire(cartKey, CACHE_OPTIONS.CART); // TTL 7 ngày
    }
    res.message = 'Thêm giỏ hàng thành công!';
    return {};
  }

  async getShoppingCart(userId: string) {
    const cartKey = `cart:${userId}`;

    const cartItem = await this.redisService.hgetall(cartKey);

    // hgetall trả {} khi giỏ trống, không phải null
    if (!cartItem || Object.keys(cartItem).length === 0) {
      throw new NotFoundException('Giỏ hàng đã hết hạn!');
    }

    // variantId[] và quantity map
    const variantIds = Object.keys(cartItem);
    const quantityMap: Record<string, number> = Object.fromEntries(
      Object.entries(cartItem).map(([id, qty]) => [id, Number(qty)]),
      //entries chuyển objec thành mảng [key, value]
      //fromEntries thì ngược lại
      // variantIds thì đảm bảo thứ tự trả về còn quantityMap không đảm bảo thứ tự trả về nên phải code như vậy
    );

    // Lấy tất cả variant 1 lần (tránh N+1)
    const variants = await this.variantRepo.find({
      where: { id: In(variantIds) },
      relations: { product: true },
    });

    // Map ra response
    const items = variants.map((variant) => ({
      productId: variant.product.id,
      productName: variant.product.name,
      variantId: variant.id,
      attributes: variant.attributes,
      quantity: quantityMap[variant.id] ?? 0,
      price: variant.price,
      // thông tin product (rút gọn theo nhu cầu)
    }));

    // const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

    return items;
  }

  async testRaceConditon(id: string, quantity: number) {
    const variantRepo = await this.variantRepo.findOneBy({ id });
    if (!variantRepo) {
      throw new BadRequestException('khong tim thay san pham!');
    }

    if (variantRepo.stock < quantity) {
      throw new BadRequestException('Hàng trong kho không đủ!');
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const newStock = variantRepo.stock - quantity;
    await this.variantRepo.update(id, {
      stock: newStock,
    });

    await this.raceRepo.save(
      this.raceRepo.create({
        code: '123',
      }),
    );
  }

  async resolveRaceConditon(id: string, quantity: number) {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const variantRepo = await transactionalEntityManager.findOne(
          ProductVariant,
          { where: { id }, lock: { mode: 'pessimistic_write' } },
        );
        // await sleep(3000);
        if (!variantRepo) {
          throw new BadRequestException('khong tim thay san pham!');
        }
        if (variantRepo.stock < quantity) {
          console.log(
            `[DEBUG] Request tạch vì hết hàng! Stock hiện tại: ${variantRepo.stock}`,
          );
          throw new BadRequestException('Hàng trong kho không đủ!');
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const newStock = variantRepo.stock - quantity;
        await transactionalEntityManager.update(
          ProductVariant,
          { id },
          { stock: newStock },
        );

        await transactionalEntityManager.save(
          transactionalEntityManager.create(Race, {
            code: 'RACE',
          }),
        );
      },
    );
  }
}
