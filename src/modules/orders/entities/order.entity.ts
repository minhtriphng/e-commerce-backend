import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import {
  PaymentMethod,
  PaymentStatus,
  Status,
} from '../../../common/enums/status.enum';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ name: 'code', type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: Status.PENDING,
  })
  status!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  // Lưu vết thông tin tài chính
  @Column({
    name: 'subtotal',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  subtotal!: number | null; // Tổng tiền hàng

  @Column({
    name: 'shipping_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    nullable: true,
  })
  shippingFee!: number; // Phí vận chuyển

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalAmount!: number; // Tổng thanh toán

  // Thông tin giao hàng
  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 30,
    default: PaymentMethod.VNPAY,
  })
  paymentMethod!: string;

  @Column({
    name: 'payment_status',
    type: 'varchar',
    length: 20,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus!: string;

  // Lưu snapshot thông tin người nhận (Họ tên, SĐT, Địa chỉ chi tiết)
  @Column({ name: 'shipping_address', type: 'jsonb' })
  shippingAddress: {
    receiverName: string;
    phone: string;
    address: string;
  };

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date; // Ngày tạo

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  orderItem!: OrderItem[];
}
