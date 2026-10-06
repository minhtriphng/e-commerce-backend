import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrder1791194165368 implements MigrationInterface {
    name = 'UpdateOrder1791194165368'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "vnpay_transaction_no" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "vnpay_transaction_no"`);
    }

}
