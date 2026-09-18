import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { Category } from './entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';

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
  ) {}

  async create(createProductDto: CreateProductDto) {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const { variants, category, ...productData } = createProductDto;
        // Tạo product mới
        const product = transactionalEntityManager.create(Product, {
          ...productData,
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

        const categoryEntities = transactionalEntityManager.create(Category, {
          name: category.name,
          slug: category.slug,
        });

        product.category = categoryEntities;
        // Lưu tất cả vào database
        return await transactionalEntityManager.save(product);
      },
    );
  }

  // async findAll(){
  //   return await this.productRepo.find({
  //     relations: ['variants', 'category'],
  //   });
  // }
  //  async findQuery(query?: any) {
  //     // Có thể xử lý lọc, phân trang từ query ở đây
  //     const product = await this.productRepo.
  //     // return this.products;
  //   }
}
