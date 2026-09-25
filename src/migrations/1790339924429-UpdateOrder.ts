import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrder1790339924429 implements MigrationInterface {
  name = 'UpdateOrder1790339924429';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "UQ_3e413c10c595c04c6c70e58a4dc"`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "code"`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "code" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "UQ_3e413c10c595c04c6c70e58a4dc" UNIQUE ("code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DEFAULT 'vnpay'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "old_price" TYPE numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "new_price" TYPE numeric(12,2)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_full_name_trgm" ON "products"  ("name") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_products_full_name_trgm"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "new_price" TYPE numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "old_price" TYPE numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "payment_method" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "UQ_3e413c10c595c04c6c70e58a4dc"`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "code"`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "code" character varying(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "UQ_3e413c10c595c04c6c70e58a4dc" UNIQUE ("code")`,
    );
  }
}
