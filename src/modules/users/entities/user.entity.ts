import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Session } from './session.entity';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../../common/enums/user.enum';
import { Provider } from '../../../common/enums/provider.enum';
import { Order } from '../../orders/entities/order.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
  password!: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone!: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address!: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({
    name: 'provider',
    type: 'enum',
    enum: Provider,
    default: Provider.LOCAL,
  })
  provider!: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];
}
