import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Transfers1717400000000 implements MigrationInterface {
  name = 'Transfers1717400000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE SEQUENCE "transfer_number_seq" START 1`);

    await q.query(`CREATE TABLE "transfer_documents" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "number" varchar NOT NULL,
      "from_location_id" uuid NOT NULL,
      "to_location_id" uuid NOT NULL,
      "date" date NOT NULL,
      "user_id" uuid NOT NULL,
      "status" "document_status_enum" NOT NULL DEFAULT 'POSTED',
      "reverses_id" uuid,
      "client_uuid" varchar,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "pk_transfer_documents" PRIMARY KEY ("id"),
      CONSTRAINT "uq_transfer_number" UNIQUE ("number"),
      CONSTRAINT "uq_transfer_client_uuid" UNIQUE ("client_uuid"),
      CONSTRAINT "chk_transfer_locations_differ" CHECK ("from_location_id" <> "to_location_id"),
      CONSTRAINT "fk_transfer_from" FOREIGN KEY ("from_location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_transfer_to" FOREIGN KEY ("to_location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_transfer_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_transfer_reverses" FOREIGN KEY ("reverses_id") REFERENCES "transfer_documents"("id") ON DELETE RESTRICT)`);
    await q.query(`CREATE INDEX "idx_transfer_date" ON "transfer_documents" ("date")`);
    await q.query(`CREATE INDEX "idx_transfer_from" ON "transfer_documents" ("from_location_id")`);
    await q.query(`CREATE INDEX "idx_transfer_to" ON "transfer_documents" ("to_location_id")`);

    await q.query(`CREATE TABLE "transfer_lines" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "transfer_id" uuid NOT NULL,
      "batch_id" uuid NOT NULL,
      "quantity" numeric(14,3) NOT NULL,
      CONSTRAINT "pk_transfer_lines" PRIMARY KEY ("id"),
      CONSTRAINT "chk_transfer_line_qty_pos" CHECK ("quantity" > 0),
      CONSTRAINT "fk_transfer_line_doc" FOREIGN KEY ("transfer_id") REFERENCES "transfer_documents"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_transfer_line_batch" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT)`);
    await q.query(`CREATE INDEX "idx_transfer_line_doc" ON "transfer_lines" ("transfer_id")`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "transfer_lines"`);
    await q.query(`DROP TABLE "transfer_documents"`);
    await q.query(`DROP SEQUENCE "transfer_number_seq"`);
  }
}
