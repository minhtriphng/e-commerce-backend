import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIndexProduct1790151399566 implements MigrationInterface {
  name = 'CreateIndexProduct1790151399566';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_products_full_name_trgm" ON "products"  ("name") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_products_full_name_trgm"`,
    );
  }
}
