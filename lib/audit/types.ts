import type { Database } from "@/lib/db/client";

export type AuditAction = "create" | "update" | "delete" | "reorder" | "restore";

export interface AuditInput {
  entityType: string;
  entityId: string | number;
  action: AuditAction;
  before: unknown;
  after: unknown;
  userId: number;
}

export function recordAudit(db: Database, input: AuditInput): number {
  return Number(
    db.prepare(
      `INSERT INTO audit_log (entity_type, entity_id, action, before_json, after_json, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      input.entityType,
      String(input.entityId),
      input.action,
      input.before === null ? null : JSON.stringify(input.before),
      input.after === null ? null : JSON.stringify(input.after),
      input.userId,
    ).lastInsertRowid,
  );
}
