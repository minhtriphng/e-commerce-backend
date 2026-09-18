import { MigrationInterface, QueryRunner } from "typeorm";

export class Race1789725772130 implements MigrationInterface {
    name = 'Race1789725772130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "races" ("id" uuid NOT NULL, "code" character varying NOT NULL, CONSTRAINT "PK_ba7d19b382156bc33244426c597" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "races"`);
    }

}
