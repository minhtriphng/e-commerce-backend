import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { Category } from './entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { RedisService } from '../redis/redis.service';
import { CACHE_OPTIONS } from '../../common/constants/cache.constant';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantRepo: Repository<ProductVariant>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
    private readonly cloudinary: CloudinaryService,
  ) {}
  async createCategory(categoryName: string) {
    const category = this.categoryRepo.create({ name: categoryName });
    await this.categoryRepo.save(category);
  }

  async createProduct(
    createProductDto: CreateProductDto,
    files: {
      thumbnail?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ) {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const thumbnailFile = files.thumbnail?.[0];
        const galleryFiles = files.gallery ?? [];

        // ===== 1. VALIDATE TRƯỚC KHI UPLOAD =====
        if (!thumbnailFile) {
          throw new BadRequestException('Vui lòng chọn ảnh chính (thumbnail)');
        }

        // entity ghi "tối đa 3 cái" thì check luôn
        if (galleryFiles.length > 3) {
          throw new BadRequestException('Tối đa 3 ảnh phụ');
        }

        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        const allFiles = [thumbnailFile, ...galleryFiles];
        for (const file of allFiles) {
          if (!allowed.includes(file.mimetype)) {
            throw new BadRequestException('Chỉ chấp nhận ảnh jpg, png, webp');
          }
        }

        // ===== 2. UPLOAD =====
        const thumbnailUrl = await this.cloudinary.uploadImage(
          thumbnailFile,
          'products',
        );

        const galleryUrls: string[] = [];
        for (const file of galleryFiles) {
          const url = await this.cloudinary.uploadImage(
            file,
            'products/gallery',
          );
          galleryUrls.push(url);
        }

        // ===== 3. LƯU DB =====
        const { variants, categoryId, ...productData } = createProductDto;
        const category = await transactionalEntityManager.findOneBy(Category, {
          id: categoryId,
        });
        if (!category) throw new BadRequestException('Danh mục không tồn tại');
        const product = transactionalEntityManager.create(Product, {
          ...productData,
          category,
          oldPrice: productData.oldPrice || null,
          thumbnailUrl, // 👈 sửa ở đây: truyền biến, không phải files.
          galleryUrls, // 👈 thêm dòng này
        });

        const variantEntities = variants.map((variantDto) =>
          transactionalEntityManager.create(ProductVariant, {
            attributes:
              typeof variantDto.attributes === 'string'
                ? JSON.parse(variantDto.attributes) // 👈 form-data gửi lên là string
                : variantDto.attributes,
            price: Number(variantDto.price),
            stock: Number(variantDto.stock),
          }),
        );
        product.variants = variantEntities;

        return await transactionalEntityManager.save(product);
      },
    );
  }

  async filterProducts(filterDto: FilterProductDto) {
    const { categorySlug, minPrice, maxPrice, cursor, limit } = filterDto;

    // 1. QueryBuilder từ Product — dùng leftJoin để giữ tất cả variant của product
    const query = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.variants', 'variant'); // 👈 leftJoinAndSelect, KHÔNG innerJoin

    // 2. Lọc theo category (bảng Category)
    if (categorySlug) {
      query.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    // 3. Lọc theo giá — DÙNG product.newPrice, KHÔNG dùng variant.price
    if (minPrice !== undefined) {
      query.andWhere('product.newPrice >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere('product.newPrice <= :maxPrice', { maxPrice });
    }

    // 4. Cursor pagination với UUIDv7
    if (cursor) {
      // Vì ORDER BY product.id DESC, các trang sau có id NHỎ HƠN cursor
      query.andWhere('product.id < :cursor', { cursor });
    }

    // 5. Sắp xếp theo UUIDv7 giảm dần (mới nhất → cũ nhất)
    query.orderBy('product.id', 'DESC');

    // 6. Dùng take() để TypeORM gom dòng join 1-N đúng số lượng Product
    query.take(Number(limit) + 1);

    const products = await query.getMany();

    // 7. Kiểm tra còn trang sau không
    const hasNextPage = products.length > Number(limit);
    if (hasNextPage) {
      products.pop(); // Bỏ item dôi ra
    }

    // 8. Next cursor = UUIDv7 của sản phẩm cuối cùng
    const nextCursor =
      products.length > 0 ? products[products.length - 1].id : null;

    return {
      data: products,
      paging: {
        limit,
        next_cursor: nextCursor,
        has_next_page: hasNextPage,
      },
    };
  }

  async searchByName(keyword: string) {
    // Nếu keyword rỗng thì trả về mảng rỗng hoặc danh sách mặc định
    if (!keyword || keyword.trim() === '') {
      return [];
    }

    // Làm sạch từ khóa (xóa khoảng trắng thừa)
    const cleanKeyword = keyword.trim();

    // Dùng QueryBuilder để viết câu SQL custom
    const products = await this.productRepo
      .createQueryBuilder('product')
      .where(
        'lower(immutable_unaccent(product.name)) LIKE lower(immutable_unaccent(:keyword))',
        {
          keyword: `%${cleanKeyword}%`, // Thêm dấu % để tìm chứa chuỗi
        },
      )
      .take(10) // Tương đương LIMIT 10 để tránh crash API nếu ra quá nhiều kết quả
      .getMany();

    return products;
  }

  async getProductDetail(id: string) {
    const cacheKey = `product:detail:${id}`;

    // 1. Kiểm tra Redis
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    // 2. Query DB lấy cả Product và mảng Variants đi kèm
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { variants: true }, // Lấy luôn danh sách variant
    });

    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm!');

    // 3. Cache nguyên object bao gồm full variants vào Redis (1 giờ)
    await this.redisService.set(
      cacheKey,
      JSON.stringify(product),
      CACHE_OPTIONS.PRODUCT_HOT,
    );

    return product;
  }

  async getLatestProducts(): Promise<Product[]> {
    return await this.productRepo.find({
      order: {
        createdAt: 'DESC', // Sắp xếp mới nhất lên đầu (giảm dần)
      },
      take: 20, // Lấy đúng 10 sản phẩm
    });
  }

  async getCategory() {
    return await this.categoryRepo.find();
  }
}
