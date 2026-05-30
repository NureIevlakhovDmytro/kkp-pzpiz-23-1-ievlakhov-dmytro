import type { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationsAudit1717500000000 implements MigrationInterface {
  name = 'NotificationsAudit1717500000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TYPE "notification_type_enum" AS ENUM ('LOW_STOCK','NEAR_EXPIRY')`);
    await q.query(`CREATE TYPE "audit_action_enum" AS ENUM (
      'LOGIN','LOGIN_FAILED','LOGOUT','DOCUMENT_POSTED','DOCUMENT_REVERSED','INVENTORY_COMPLETED',
      'REFERENCE_CHANGED','USER_CREATED','USER_ROLE_CHANGED','USER_ANONYMIZED','BACKUP_CREATED',
      'DATA_EXPORTED','DATA_IMPORTED','PD_EXPORTED','PD_ERASED')`);

    await q.query(`CREATE TABLE "notifications" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "type" "notification_type_enum" NOT NULL,
      "payload" jsonb NOT NULL,
      "product_id" uuid,
      "batch_id" uuid,
      "is_read" boolean NOT NULL DEFAULT false,
      "resolved_at" timestamptz,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "pk_notifications" PRIMARY KEY ("id"),
      CONSTRAINT "fk_notification_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT,
      CONSTRAINT "fk_notification_batch" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT)`);
    await q.query(
      `CREATE INDEX "idx_notification_active" ON "notifications" ("type","is_read") WHERE "resolved_at" IS NULL`,
    );

    await q.query(`CREATE TABLE "audit_logs" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "user_id" uuid,
      "action" "audit_action_enum" NOT NULL,
      "entity" varchar,
      "entity_id" varchar,
      "details" jsonb,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "pk_audit_logs" PRIMARY KEY ("id"),
      CONSTRAINT "fk_audit_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL)`);
    await q.query(`CREATE INDEX "idx_audit_user" ON "audit_logs" ("user_id")`);
    await q.query(`CREATE INDEX "idx_audit_action" ON "audit_logs" ("action")`);
    await q.query(`CREATE INDEX "idx_audit_created" ON "audit_logs" ("created_at")`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "audit_logs"`);
    await q.query(`DROP TABLE "notifications"`);
    await q.query(`DROP TYPE "audit_action_enum"`);
    await q.query(`DROP TYPE "notification_type_enum"`);
  }
}
