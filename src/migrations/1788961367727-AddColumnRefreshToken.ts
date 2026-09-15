import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnRefreshToken1788961367727 implements MigrationInterface {
    name = 'AddColumnRefreshToken1788961367727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth_sessions" ADD "refresh_token" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth_sessions" DROP CONSTRAINT "PK_641507381f32580e8479efc36cd"`);
        await queryRunner.query(`ALTER TABLE "auth_sessions" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "auth_sessions" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "auth_sessions" ADD CONSTRAINT "PK_641507381f32580e8479efc36cd" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth_sessions" DROP CONSTRAINT "PK_641507381f32580e8479efc36cd"`);
        await queryRunner.query(`ALTER TABLE "auth_sessions" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "auth_sessions" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth_sessions" ADD CONSTRAINT "PK_641507381f32580e8479efc36cd" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "auth_sessions" DROP COLUMN "refresh_token"`);
    }

}
