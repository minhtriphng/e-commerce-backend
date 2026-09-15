// product.entity.ts
import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { Category } from './category.entity';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string; // Tên sản phẩm

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string; // Mô tả

  @Column({ name: 'thumbnail_url', type: 'text' })
  thumbnailUrl!: string; // Ảnh chính (hiển thị list)

  @Column({ name: 'gallery_urls', type: 'text', array: true, default: [] })
  galleryUrls!: string[]; // Mảng ảnh phụ (tối đa 3 cái)

  @Column({ name: 'old_price', type: 'decimal', nullable: true })
  oldPrice!: number | null; // Giá cũ (nếu có)

  @Column({ name: 'new_price', type: 'decimal' })
  newPrice!: number; // Giá mới (giá hiện tại)

  @ManyToOne(() => Category, (category) => category.products, {
    cascade: true,
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category; // Danh mục

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date; // Ngày tạo

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants!: ProductVariant[]; // Các biến thể
}
