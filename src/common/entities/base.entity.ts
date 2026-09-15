import { PrimaryColumn, BeforeInsert } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

export abstract class BaseEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @BeforeInsert() //là một hook (entity listener) được TypeORM tự động gọi trước khi entity được insert vào database.
  generateId() {
    if (!this.id) {
      this.id = uuidv7(); // Sinh UUIDv7 ở tầng App
    }
  }
}
