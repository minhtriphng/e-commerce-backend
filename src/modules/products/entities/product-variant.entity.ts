// product-variant.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('product_variants')
export class ProductVariant extends BaseEntity {
  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'attributes', type: 'jsonb' })
  attributes!: Record<string, string>; // VD: { size: 'XL', color: 'Đỏ' }

  @Column({ name: 'price', type: 'decimal' })
  price!: number; // Giá của biến thể

  @Column({ name: 'stock', type: 'int' })
  stock!: number; // Tồn kho
}
