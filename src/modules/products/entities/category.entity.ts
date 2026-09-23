// category.entity.ts
import { Entity, Column, OneToMany, BeforeInsert } from 'typeorm';
import { Product } from './product.entity';
import { BaseEntity } from '../../../common/entities/base.entity';
import slugify from 'slugify';
@Entity('categories')
export class Category extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
  name!: string; // Tên danh mục: "Điện thoại", "Laptop"

  @Column({ name: 'slug', type: 'varchar', length: 100, unique: true })
  slug!: string; // "dien-thoai", "laptop" (cho URL)
  @BeforeInsert()
  generateSlug() {
    if (this.name) {
      this.slug = slugify(this.name, {
        lower: true,
        strict: true,
        locale: 'vi', // hỗ trợ tiếng Việt
      });
    }
  }

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}
