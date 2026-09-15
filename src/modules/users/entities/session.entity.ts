import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { User } from './user.entity';
@Entity('auth_sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'refresh_token', type: 'text' })
  refreshToken!: string;

  //Chỉ có ManyToOne, KHÔNG có @Column userId
  @ManyToOne(() => User, (user) => user.sessions, {
    onDelete: 'CASCADE', // Xóa user thì xóa session
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
