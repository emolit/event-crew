import type { Database } from "@/lib/db/client";
import { openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";

export interface RecentChange {
  id: number;
  entityType: string;
  entityId: string;
  action: string;
  createdAt: string;
}

export interface AdminOverview {
  projectCount: number;
  personnelCount: number;
  clientCount: number;
  recentChanges: RecentChange[];
}

export function getAdminOverview(options: { db?: Database } = {}): AdminOverview {
  const db = options.db ?? overviewDatabase();
  const count = (table: "projects" | "personnel" | "clients") =>
    Number((db.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE deleted_at IS NULL`).get() as { count: number }).count);
  const rows = db
    .prepare(
      `SELECT id, entity_type, entity_id, action, created_at
       FROM audit_log ORDER BY created_at DESC, id DESC LIMIT 8`,
    )
    .all() as Array<{ id: number; entity_type: string; entity_id: string; action: string; created_at: string }>;
  return {
    projectCount: count("projects"),
    personnelCount: count("personnel"),
    clientCount: count("clients"),
    recentChanges: rows.map((row) => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      createdAt: row.created_at,
    })),
  };
}

function overviewDatabase(): Database {
  const db = openDatabase();
  runMigrations(db);
  return db;
}
