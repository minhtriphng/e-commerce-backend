import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('races')
export class Race extends BaseEntity {
  @Column()
  code!: string;
}
