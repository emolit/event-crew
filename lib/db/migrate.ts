import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import type { Database } from "@/lib/db/client";

interface MigrationFile {
  version: number;
  path: string;
}

export function runMigrations(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const applied = new Set(
    (db.prepare("SELECT version FROM schema_migrations").all() as Array<{ version: number }>).map(
      ({ version }) => version,
    ),
  );

  for (const migration of listMigrations()) {
    if (applied.has(migration.version)) {
      continue;
    }

    const sql = readFileSync(migration.path, "utf8");
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(sql);
      db.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(migration.version);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
}

function listMigrations(): MigrationFile[] {
  const directory = resolve(process.cwd(), "db", "migrations");
  return readdirSync(directory)
    .map((name) => ({ name, match: /^(\d+)_.*\.sql$/.exec(name) }))
    .filter((entry): entry is { name: string; match: RegExpExecArray } => Boolean(entry.match))
    .map(({ name, match }) => ({ version: Number(match[1]), path: resolve(directory, name) }))
    .sort((left, right) => left.version - right.version);
}
