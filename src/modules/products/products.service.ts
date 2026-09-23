import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { Category } from './entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { RedisService } from '../redis/redis.service';

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
  ) {}
  async createCategory(categoryName: string) {
    const category = this.categoryRepo.create({ name: categoryName });
    await this.categoryRepo.save(category);
  }

  async createProduct(createProductDto: CreateProductDto) {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const { variants, category, ...productData } = createProductDto;
        // Tạo product mới
        const product = transactionalEntityManager.create(Product, {
          ...productData,
          category: category,
          oldPrice: productData.oldPrice || null,
        });

        // Tạo variants
        const variantEntities = variants.map((variantDto) => {
          return transactionalEntityManager.create(ProductVariant, {
            attributes: variantDto.attributes,
            price: variantDto.price,
            stock: variantDto.stock,
            // product: product,
          });
        });
        product.variants = variantEntities;
        // Lưu tất cả vào database
        return await transactionalEntityManager.save(product);
      },
    );
  }

  async filterProducts(filterDto: FilterProductDto) {
    const { categorySlug, minPrice, maxPrice, cursor, limit, ...attributes } =
      filterDto;
    // 1. Tạo QueryBuilder từ Product
    const query = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category') // Join với bảng Category
      .innerJoinAndSelect('product.variants', 'variant'); // Join với bảng ProductVariant (Dùng innerJoin để chỉ lấy SP có variant thỏa điều kiện)

    // 2. Lọc theo Danh mục (nằm ở bảng Category)
    if (categorySlug) {
      query.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    // 3. Lọc theo Khoảng giá (nằm ở bảng ProductVariant)
    if (minPrice !== undefined) {
      query.andWhere('variant.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere('variant.price <= :maxPrice', { maxPrice });
    }

    // 4. Lọc theo thuộc tính JSONB (nằm ở bảng ProductVariant)
    if (attributes && Object.keys(attributes).length > 0) {
      Object.entries(attributes).forEach(([key, value]) => {
        if (value) {
          query.andWhere(`variant.attributes->>'${key}' = :value_${key}`, {
            [`value_${key}`]: String(value),
          });
        }
      });
    }
    // =========================================================
    // CURSOR PAGINATION VỚI UUIDv7 (Siêu gọn)
    // =========================================================
    if (cursor) {
      // Vì ORDER BY product.id DESC, nên các trang sau sẽ có id NHỎ HƠN cursor
      query.andWhere('product.id < :cursor', { cursor });
    }

    // Sắp xếp theo UUIDv7 giảm dần (Đồng nghĩa với Mới nhất -> Cũ nhất)
    query.orderBy('product.id', 'DESC');

    // Dùng take() để TypeORM xử lý gom dòng Join 1-N đúng số lượng Product
    query.take(Number(limit) + 1);

    const products = await query.getMany();

    // Kiểm tra còn trang sau không
    const hasNextPage = products.length > Number(limit);
    if (hasNextPage) {
      products.pop(); // Bỏ item dôi ra
    }

    // Next cursor chính là UUIDv7 của sản phẩm cuối cùng trong list
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
    // return await query.getMany();
    //     SELECT
    //     product.*,
    //     category.*,
    //     variant.*
    // FROM product product

    // LEFT JOIN category category
    //     ON category.id = product.category_id

    // INNER JOIN product_variant variant
    //     ON variant.product_id = product.id

    // WHERE category.slug = 'dien-thoai'

    //   AND variant.price >= 5000000

    //   AND variant.attributes->>'ram' = '8GB';
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
    await this.redisService.set(cacheKey, JSON.stringify(product), 3600);

    return product;
  }
}
