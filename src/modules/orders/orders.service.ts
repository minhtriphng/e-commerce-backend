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
  ) {}

  //   async createOrderSimple(userId: string, dto: CreateOrderDto) {
  //     let subtotal = 0;
  //     const orderItems: OrderItem[] = [];

  //     // 1. Duyệt danh sách item, kiểm tra & trừ stock thông thường
  //     for (const item of dto.items) {
  //       const variant = await this.variantRepo.findOne({
  //         where: { id: item.productVariantId },
  //         relations: { product: true },
  //       });

  //       if (!variant) {
  //         throw new NotFoundException(
  //           `Biến thể ${item.productVariantId} không tồn tại`,
  //         );
  //       }

  //       if (variant.stock < item.quantity) {
  //         throw new BadRequestException(
  //           `Sản phẩm ${variant.product.name} không đủ tồn kho`,
  //         );
  //       }
  //       await new Promise((r) => setTimeout(r, 300));
  //       // Trừ kho trực tiếp
  //       variant.stock -= item.quantity;
  //       await this.variantRepo.save(variant);

  //       // Tính toán & lưu Snapshot
  //       const itemTotalPrice = Number(variant.price) * item.quantity;
  //       subtotal += itemTotalPrice;

  //       const orderItem = new OrderItem();
  //       orderItem.productVariantId = variant.id;
  //       orderItem.productName = variant.product.name;
  //       orderItem.price = variant.price;
  //       orderItem.quantity = item.quantity;
  //       orderItem.totalPrice = itemTotalPrice;

  //       orderItems.push(orderItem);
  //     }

  //     // 2. Tạo và Save Order
  //     const shippingFee = 30000;
  //     const totalAmount = subtotal + shippingFee;

  //     const order = this.orderRepo.create({
  //       code: `ORD-${Date.now()}`,
  //       userId,
  //       status: Status.PENDING,
  //       subtotal,
  //       shippingFee,
  //       totalAmount,
  //       shippingAddress: dto.shippingAddress,
  //       paymentMethod: dto.paymentMethod,
  //       paymentStatus: PaymentStatus.UNPAID,
  //       orderItem: orderItems, // Nhờ cascade: true ở OrderEntity nên items tự được lưu cùng
  //     });

  //     const savedOrder = await this.orderRepo.save(order);

  //     // // 3. Xóa items khỏi giỏ hàng
  //     // const variantIds = dto.items.map((i) => i.productVariantId);
  //     // await this.cartItemRepo.delete({
  //     //   userId,
  //     //   productVariantId: In(variantIds),
  //     // });

  //     return savedOrder;
  //   }
  // orders.service.ts

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
