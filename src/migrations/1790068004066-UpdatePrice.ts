import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePrice1790068004066 implements MigrationInterface {
    name = 'UpdatePrice1790068004066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "old_price" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "new_price" TYPE numeric(12,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "new_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "old_price" TYPE numeric`);
    }

}
