import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Category } from './entities/category.entity';
import { RedisService } from '../redis/redis.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant, Category]),
    CloudinaryModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, RedisService],
})
export class ProductsModule {}
