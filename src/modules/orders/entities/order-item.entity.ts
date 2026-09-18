import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.orderItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'product_variant_id', type: 'uuid' })
  productVariantId: string;

  // Snapshot thông tin sản phẩm
  @Column({ name: 'product_name', type: 'text' })
  productName: string;

  @Column({ name: 'variant_name', type: 'text', nullable: true })
  variantName: string;

  @Column({ name: 'price', type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2 })
  totalPrice: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date; // Ngày tạo
}
