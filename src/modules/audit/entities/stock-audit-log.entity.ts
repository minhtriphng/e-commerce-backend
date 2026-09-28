// src/modules/audit/entities/stock-audit-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('stock_audit_logs')
@Index(['productVariantId', 'createdAt'])
export class StockAuditLog extends BaseEntity {
  @Column({ name: 'product_id', type: 'uuid' })
  productVariantId: string;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId: string | null; // null = hệ thống tự làm

  @Column({ name: 'old_stock', type: 'int' })
  oldStock: number;

  @Column({ name: 'new_stock', type: 'int' })
  newStock: number;

  @Column({ length: 255 })
  reason: string; // "Đặt hàng abc", "Admin nhập hàng"...

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string | null; // order_id nếu có

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
