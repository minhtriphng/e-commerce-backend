import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditLog1790514162718 implements MigrationInterface {
    name = 'CreateAuditLog1790514162718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stock_audit_logs" ("id" uuid NOT NULL, "product_id" uuid NOT NULL, "actor_id" uuid, "old_stock" integer NOT NULL, "new_stock" integer NOT NULL, "reason" character varying(255) NOT NULL, "reference_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ab9d704802354db325e7905c91f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_11932ddc34fdc7c2a2365ae82d" ON "stock_audit_logs"  ("product_id", "created_at") `);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "variant_name"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" ADD "variant_name" text`);
        await queryRunner.query(`DROP INDEX "public"."IDX_11932ddc34fdc7c2a2365ae82d"`);
        await queryRunner.query(`DROP TABLE "stock_audit_logs"`);
    }

}
