import type { MigrationInterface, QueryRunner } from 'typeorm';

export class StockIn1717200000000 implements MigrationInterface {
  name = 'StockIn1717200000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TYPE "document_status_enum" AS ENUM ('POSTED','REVERSED')`);

    await q.query(`CREATE TABLE "batches" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "product_id" uuid NOT NULL,
      "batch_number" varchar NOT NULL,
      "expiry_date" date,
      "received_date" date NOT NULL,
      "unit_cost" numeric(14,2) NOT NULL,
      "currency_id" uuid NOT NULL,
      "supplier_id" uuid,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "pk_batches" PRIMARY KEY ("id"),
      CONSTRAINT "chk_batches_unit_cost" CHECK ("unit_cost" >= 0),
      CONSTRAINT "fk_batches_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_batches_currency" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_batches_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT)`);
    await q.query(`CREATE INDEX "idx_batches_product" ON "batches" ("product_id")`);
    await q.query(`CREATE INDEX "idx_batches_expiry" ON "batches" ("expiry_date")`);

    await q.query(`CREATE TABLE "stock_levels" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "batch_id" uuid NOT NULL,
      "location_id" uuid NOT NULL,
      "quantity" numeric(14,3) NOT NULL DEFAULT 0,
      "version" int NOT NULL DEFAULT 1,
      CONSTRAINT "pk_stock_levels" PRIMARY KEY ("id"),
      CONSTRAINT "uq_stock_batch_location" UNIQUE ("batch_id","location_id"),
      CONSTRAINT "chk_stock_qty_nonneg" CHECK ("quantity" >= 0),
      CONSTRAINT "fk_stock_batch" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_stock_location" FOREIGN KEY ("location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT)`);
    await q.query(`CREATE INDEX "idx_stock_location" ON "stock_levels" ("location_id")`);

    await q.query(`CREATE SEQUENCE "receipt_number_seq" START 1`);

    await q.query(`CREATE TABLE "receipt_documents" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "number" varchar NOT NULL,
      "supplier_id" uuid,
      "location_id" uuid NOT NULL,
      "date" date NOT NULL,
      "user_id" uuid NOT NULL,
      "status" "document_status_enum" NOT NULL DEFAULT 'POSTED',
      "reverses_id" uuid,
      "client_uuid" varchar,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "pk_receipt_documents" PRIMARY KEY ("id"),
      CONSTRAINT "uq_receipt_number" UNIQUE ("number"),
      CONSTRAINT "uq_receipt_client_uuid" UNIQUE ("client_uuid"),
      CONSTRAINT "fk_receipt_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_receipt_location" FOREIGN KEY ("location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_receipt_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_receipt_reverses" FOREIGN KEY ("reverses_id") REFERENCES "receipt_documents"("id") ON DELETE RESTRICT)`);
    await q.query(`CREATE INDEX "idx_receipt_date" ON "receipt_documents" ("date")`);
    await q.query(`CREATE INDEX "idx_receipt_supplier" ON "receipt_documents" ("supplier_id")`);
    await q.query(`CREATE INDEX "idx_receipt_location" ON "receipt_documents" ("location_id")`);

    await q.query(`CREATE TABLE "receipt_lines" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "receipt_id" uuid NOT NULL,
      "product_id" uuid NOT NULL,
      "batch_id" uuid NOT NULL,
      "batch_number" varchar NOT NULL,
      "expiry_date" date,
      "quantity" numeric(14,3) NOT NULL,
      "unit_cost" numeric(14,2) NOT NULL,
      "currency_id" uuid NOT NULL,
      CONSTRAINT "pk_receipt_lines" PRIMARY KEY ("id"),
      CONSTRAINT "chk_receipt_line_qty_pos" CHECK ("quantity" > 0),
      CONSTRAINT "chk_receipt_line_cost_nonneg" CHECK ("unit_cost" >= 0),
      CONSTRAINT "fk_receipt_line_receipt" FOREIGN KEY ("receipt_id") REFERENCES "receipt_documents"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_receipt_line_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_receipt_line_batch" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_receipt_line_currency" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE RESTRICT)`);
    await q.query(`CREATE INDEX "idx_receipt_line_receipt" ON "receipt_lines" ("receipt_id")`);
    await q.query(`CREATE INDEX "idx_receipt_line_batch" ON "receipt_lines" ("batch_id")`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "receipt_lines"`);
    await q.query(`DROP TABLE "receipt_documents"`);
    await q.query(`DROP SEQUENCE "receipt_number_seq"`);
    await q.query(`DROP TABLE "stock_levels"`);
    await q.query(`DROP TABLE "batches"`);
    await q.query(`DROP TYPE "document_status_enum"`);
  }
}
