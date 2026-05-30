import type { MigrationInterface, QueryRunner } from 'typeorm';

export class StarOperations1717300000000 implements MigrationInterface {
  name = 'StarOperations1717300000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TYPE "inventory_status_enum" AS ENUM ('DRAFT','COMPLETED')`);
    await q.query(`CREATE SEQUENCE "write_off_number_seq" START 1`);
    await q.query(`CREATE SEQUENCE "inventory_number_seq" START 1`);
    await q.query(`CREATE SEQUENCE "adjustment_number_seq" START 1`);

    await q.query(`CREATE TABLE "write_off_documents" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "number" varchar NOT NULL,
      "date" date NOT NULL,
      "user_id" uuid NOT NULL,
      "reason_id" uuid NOT NULL,
      "comment" varchar,
      "status" "document_status_enum" NOT NULL DEFAULT 'POSTED',
      "reverses_id" uuid,
      "client_uuid" varchar,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "pk_write_off_documents" PRIMARY KEY ("id"),
      CONSTRAINT "uq_write_off_number" UNIQUE ("number"),
      CONSTRAINT "uq_write_off_client_uuid" UNIQUE ("client_uuid"),
      CONSTRAINT "fk_write_off_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_write_off_reason" FOREIGN KEY ("reason_id") REFERENCES "write_off_reasons"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_write_off_reverses" FOREIGN KEY ("reverses_id") REFERENCES "write_off_documents"("id") ON DELETE RESTRICT)`);
    await q.query(`CREATE INDEX "idx_write_off_date" ON "write_off_documents" ("date")`);
    await q.query(`CREATE INDEX "idx_write_off_reason" ON "write_off_documents" ("reason_id")`);

    await q.query(`CREATE TABLE "write_off_lines" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "write_off_id" uuid NOT NULL,
      "batch_id" uuid NOT NULL,
      "location_id" uuid NOT NULL,
      "quantity" numeric(14,3) NOT NULL,
      CONSTRAINT "pk_write_off_lines" PRIMARY KEY ("id"),
      CONSTRAINT "chk_write_off_line_qty_pos" CHECK ("quantity" > 0),
      CONSTRAINT "fk_write_off_line_doc" FOREIGN KEY ("write_off_id") REFERENCES "write_off_documents"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_write_off_line_batch" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_write_off_line_location" FOREIGN KEY ("location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT)`);
    await q.query(`CREATE INDEX "idx_write_off_line_doc" ON "write_off_lines" ("write_off_id")`);

    await q.query(`CREATE TABLE "inventory_counts" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "number" varchar NOT NULL,
      "location_id" uuid NOT NULL,
      "date" date NOT NULL,
      "user_id" uuid NOT NULL,
      "status" "inventory_status_enum" NOT NULL DEFAULT 'DRAFT',
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "pk_inventory_counts" PRIMARY KEY ("id"),
      CONSTRAINT "uq_inventory_number" UNIQUE ("number"),
      CONSTRAINT "fk_inventory_location" FOREIGN KEY ("location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_inventory_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT)`);
    await q.query(
      `CREATE UNIQUE INDEX "uq_inventory_one_draft_per_location" ON "inventory_counts" ("location_id") WHERE "status" = 'DRAFT'`,
    );

    await q.query(`CREATE TABLE "inventory_count_lines" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "inventory_id" uuid NOT NULL,
      "batch_id" uuid NOT NULL,
      "expected_qty" numeric(14,3) NOT NULL,
      "actual_qty" numeric(14,3),
      "discrepancy" numeric(14,3),
      CONSTRAINT "pk_inventory_count_lines" PRIMARY KEY ("id"),
      CONSTRAINT "uq_inventory_line_batch" UNIQUE ("inventory_id","batch_id"),
      CONSTRAINT "chk_inventory_actual_nonneg" CHECK ("actual_qty" IS NULL OR "actual_qty" >= 0),
      CONSTRAINT "fk_inventory_line_inv" FOREIGN KEY ("inventory_id") REFERENCES "inventory_counts"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_inventory_line_batch" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT)`);

    await q.query(`CREATE TABLE "stock_adjustments" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "number" varchar NOT NULL,
      "date" date NOT NULL,
      "user_id" uuid NOT NULL,
      "inventory_id" uuid NOT NULL,
      "comment" varchar,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "pk_stock_adjustments" PRIMARY KEY ("id"),
      CONSTRAINT "uq_adjustment_number" UNIQUE ("number"),
      CONSTRAINT "uq_adjustment_inventory" UNIQUE ("inventory_id"),
      CONSTRAINT "fk_adjustment_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_adjustment_inventory" FOREIGN KEY ("inventory_id") REFERENCES "inventory_counts"("id") ON DELETE RESTRICT)`);

    await q.query(`CREATE TABLE "stock_adjustment_lines" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "adjustment_id" uuid NOT NULL,
      "batch_id" uuid NOT NULL,
      "location_id" uuid NOT NULL,
      "delta" numeric(14,3) NOT NULL,
      "reason_id" uuid,
      CONSTRAINT "pk_stock_adjustment_lines" PRIMARY KEY ("id"),
      CONSTRAINT "chk_adjustment_line_delta_nonzero" CHECK ("delta" <> 0),
      CONSTRAINT "fk_adjustment_line_adj" FOREIGN KEY ("adjustment_id") REFERENCES "stock_adjustments"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_adjustment_line_batch" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_adjustment_line_location" FOREIGN KEY ("location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_adjustment_line_reason" FOREIGN KEY ("reason_id") REFERENCES "write_off_reasons"("id") ON DELETE RESTRICT)`);
    await q.query(
      `CREATE INDEX "idx_adjustment_line_adj" ON "stock_adjustment_lines" ("adjustment_id")`,
    );
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "stock_adjustment_lines"`);
    await q.query(`DROP TABLE "stock_adjustments"`);
    await q.query(`DROP TABLE "inventory_count_lines"`);
    await q.query(`DROP TABLE "inventory_counts"`);
    await q.query(`DROP TABLE "write_off_lines"`);
    await q.query(`DROP TABLE "write_off_documents"`);
    await q.query(`DROP SEQUENCE "adjustment_number_seq"`);
    await q.query(`DROP SEQUENCE "inventory_number_seq"`);
    await q.query(`DROP SEQUENCE "write_off_number_seq"`);
    await q.query(`DROP TYPE "inventory_status_enum"`);
  }
}
