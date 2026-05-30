import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUsers1716998400000 implements MigrationInterface {
  name = 'InitUsers1716998400000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await q.query(`CREATE TYPE "users_role_enum" AS ENUM ('USER','ADMIN')`);
    await q.query(`CREATE TYPE "users_locale_enum" AS ENUM ('uk','en')`);
    await q.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" varchar NOT NULL,
        "password_hash" varchar NOT NULL,
        "full_name" varchar NOT NULL,
        "role" "users_role_enum" NOT NULL,
        "locale" "users_locale_enum" NOT NULL DEFAULT 'uk',
        "is_active" boolean NOT NULL DEFAULT true,
        "anonymized_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_users" PRIMARY KEY ("id"),
        CONSTRAINT "uq_users_email" UNIQUE ("email")
      )`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "users"`);
    await q.query(`DROP TYPE "users_locale_enum"`);
    await q.query(`DROP TYPE "users_role_enum"`);
  }
}
