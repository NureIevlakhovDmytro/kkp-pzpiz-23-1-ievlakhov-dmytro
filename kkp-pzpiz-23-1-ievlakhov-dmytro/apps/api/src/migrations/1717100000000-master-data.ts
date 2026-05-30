import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterData1717100000000 implements MigrationInterface {
  name = 'MasterData1717100000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE "categories" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "name" varchar NOT NULL,
      "is_active" boolean NOT NULL DEFAULT true,
      CONSTRAINT "pk_categories" PRIMARY KEY ("id"))`);
    await q.query(`CREATE UNIQUE INDEX "uq_categories_name_active" ON "categories" ("name") WHERE "is_active"`);

    await q.query(`CREATE TABLE "units" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "code" varchar NOT NULL,
      "name" varchar NOT NULL,
      "is_active" boolean NOT NULL DEFAULT true,
      CONSTRAINT "pk_units" PRIMARY KEY ("id"))`);
    await q.query(`CREATE UNIQUE INDEX "uq_units_code_active" ON "units" ("code") WHERE "is_active"`);

    await q.query(`CREATE TABLE "suppliers" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "name" varchar NOT NULL,
      "contact_info" varchar,
      "is_active" boolean NOT NULL DEFAULT true,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "pk_suppliers" PRIMARY KEY ("id"))`);

    await q.query(`CREATE TABLE "storage_locations" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "name" varchar NOT NULL,
      "description" varchar,
      "is_active" boolean NOT NULL DEFAULT true,
      CONSTRAINT "pk_storage_locations" PRIMARY KEY ("id"))`);

    await q.query(`CREATE TABLE "currencies" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "code" varchar NOT NULL,
      "name" varchar NOT NULL,
      "symbol" varchar,
      CONSTRAINT "pk_currencies" PRIMARY KEY ("id"),
      CONSTRAINT "uq_currencies_code" UNIQUE ("code"))`);

    await q.query(`CREATE TABLE "exchange_rates" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "currency_id" uuid NOT NULL,
      "rate_to_base" numeric(18,6) NOT NULL,
      "effective_date" date NOT NULL,
      CONSTRAINT "pk_exchange_rates" PRIMARY KEY ("id"),
      CONSTRAINT "uq_exchange_rate_currency_date" UNIQUE ("currency_id","effective_date"),
      CONSTRAINT "fk_exchange_rate_currency" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE RESTRICT)`);

    await q.query(`CREATE TYPE "write_off_reason_code_enum" AS ENUM ('SPOILAGE','OVERPRODUCTION','RECEIVING_ERROR','BREAKAGE','SHORTAGE')`);
    await q.query(`CREATE TABLE "write_off_reasons" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "code" "write_off_reason_code_enum" NOT NULL,
      "name_uk" varchar NOT NULL,
      "name_en" varchar NOT NULL,
      CONSTRAINT "pk_write_off_reasons" PRIMARY KEY ("id"),
      CONSTRAINT "uq_write_off_reason_code" UNIQUE ("code"))`);

    await q.query(`CREATE TABLE "products" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "name" varchar NOT NULL,
      "sku" varchar,
      "category_id" uuid,
      "unit_id" uuid NOT NULL,
      "min_stock" numeric(14,3) NOT NULL DEFAULT 0,
      "shelf_life_days" int,
      "is_active" boolean NOT NULL DEFAULT true,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "pk_products" PRIMARY KEY ("id"),
      CONSTRAINT "chk_products_min_stock" CHECK ("min_stock" >= 0),
      CONSTRAINT "fk_products_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_products_unit" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT)`);
    await q.query(`CREATE UNIQUE INDEX "uq_products_sku_active" ON "products" ("sku") WHERE "is_active" AND "sku" IS NOT NULL`);
    await q.query(`CREATE INDEX "idx_products_category" ON "products" ("category_id")`);
    await q.query(`CREATE INDEX "idx_products_unit" ON "products" ("unit_id")`);

    await q.query(`CREATE TABLE "app_settings" (
      "id" int NOT NULL DEFAULT 1,
      "near_expiry_days" int NOT NULL DEFAULT 3,
      "low_stock_check_enabled" boolean NOT NULL DEFAULT true,
      "near_expiry_check_enabled" boolean NOT NULL DEFAULT true,
      "base_currency_id" uuid NOT NULL,
      "backup_schedule" varchar,
      CONSTRAINT "pk_app_settings" PRIMARY KEY ("id"),
      CONSTRAINT "chk_app_settings_singleton" CHECK ("id" = 1),
      CONSTRAINT "fk_app_settings_currency" FOREIGN KEY ("base_currency_id") REFERENCES "currencies"("id") ON DELETE RESTRICT)`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "app_settings"`);
    await q.query(`DROP TABLE "products"`);
    await q.query(`DROP TABLE "write_off_reasons"`);
    await q.query(`DROP TYPE "write_off_reason_code_enum"`);
    await q.query(`DROP TABLE "exchange_rates"`);
    await q.query(`DROP TABLE "currencies"`);
    await q.query(`DROP TABLE "storage_locations"`);
    await q.query(`DROP TABLE "suppliers"`);
    await q.query(`DROP TABLE "units"`);
    await q.query(`DROP TABLE "categories"`);
  }
}
