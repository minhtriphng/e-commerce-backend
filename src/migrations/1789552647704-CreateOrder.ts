import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrder1789552647704 implements MigrationInterface {
    name = 'CreateOrder1789552647704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL, "code" character varying(20) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'pending', "userId" uuid NOT NULL, "subtotal" numeric(12,2) NOT NULL DEFAULT '0', "shipping_fee" numeric(12,2) DEFAULT '0', "total_amount" numeric(12,2) NOT NULL DEFAULT '0', "payment_method" character varying(30) NOT NULL, "payment_status" character varying(20) NOT NULL DEFAULT 'unpaid', "shipping_address" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3e413c10c595c04c6c70e58a4dc" UNIQUE ("code"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL, "product_variant_id" uuid NOT NULL, "product_name" text NOT NULL, "variant_name" text, "price" numeric(12,2) NOT NULL, "quantity" integer NOT NULL, "total_price" numeric(12,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "order_id" uuid, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "orders"`);
    }

}
