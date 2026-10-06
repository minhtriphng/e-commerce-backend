// src/migrations/1700000000000-AddUnaccentExtension.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUnaccentExtension1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent;`);
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION immutable_unaccent(text)
      RETURNS text AS $$
        SELECT public.unaccent('public.unaccent', $1)
      $$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS immutable_unaccent(text);`,
    );
    await queryRunner.query(`DROP EXTENSION IF EXISTS unaccent;`);
  }
}
