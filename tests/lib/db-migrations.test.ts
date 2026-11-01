// @vitest-environment node

import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { getAdminConfig } from "@/lib/admin/config";
import { closeDatabaseForTests, openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";

afterEach(() => {
  closeDatabaseForTests();
});

function openTemporaryDatabase() {
  const dataDir = mkdtempSync(join(tmpdir(), "event-crew-db-"));
  return openDatabase(
    getAdminConfig({
      NODE_ENV: "test",
      EVENT_CREW_DATA_DIR: dataDir,
      SESSION_SECRET: "c".repeat(64),
    }),
  );
}

describe("database migrations", () => {
  test("creates the complete admin schema with foreign keys enabled", () => {
    const db = openTemporaryDatabase();
    runMigrations(db);

    const foreignKeys = db.prepare("PRAGMA foreign_keys").get() as { foreign_keys: number };
    const tableRows = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all() as Array<{ name: string }>;

    expect(foreignKeys.foreign_keys).toBe(1);
    expect(tableRows.map(({ name }) => name)).toEqual(
      expect.arrayContaining([
        "audit_log",
        "clients",
        "footer_content",
        "media_assets",
        "personnel",
        "project_images",
        "projects",
        "schema_migrations",
        "sessions",
        "site_content",
        "users",
      ]),
    );

    const auditColumns = db.prepare("PRAGMA table_info(audit_log)").all() as Array<{
      name: string;
    }>;
    expect(auditColumns.map(({ name }) => name)).toEqual(
      expect.arrayContaining(["restored_at", "restored_by_user_id", "restored_from_json"]),
    );
  });

  test("applies each migration exactly once", () => {
    const db = openTemporaryDatabase();

    runMigrations(db);
    runMigrations(db);

    const rows = db.prepare("SELECT version FROM schema_migrations ORDER BY version").all();
    expect(rows).toEqual([{ version: 1 }, { version: 2 }, { version: 3 }]);
  });

  test("moves the default homepage call to action to the restored contact form", () => {
    const db = openTemporaryDatabase();
    runMigrations(db);

    db.prepare("DELETE FROM schema_migrations WHERE version = 3").run();
    db.prepare(
      `INSERT INTO site_content (
        id, eyebrow, title, subtitle, primary_button_text, primary_button_href,
        secondary_button_text, secondary_button_href
      ) VALUES (1, 'EVENT CREW', 'Title', 'Subtitle', 'CTA', '#contacts', 'More', '/personnel')`,
    ).run();
    runMigrations(db);

    const homepage = db.prepare("SELECT primary_button_href FROM site_content WHERE id = 1").get();
    expect(homepage).toEqual({ primary_button_href: "#contact" });
  });

  test("enforces active ordering uniqueness without blocking soft-deleted rows", () => {
    const db = openTemporaryDatabase();
    runMigrations(db);

    db.prepare(
      "INSERT INTO projects (slug, title, type, roles_json, size, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
    ).run("first", "Первый", "Фестиваль", "[]", "standard", 0);

    expect(() =>
      db
        .prepare(
          "INSERT INTO projects (slug, title, type, roles_json, size, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .run("second", "Второй", "Фестиваль", "[]", "standard", 0),
    ).toThrow();

    db.prepare("UPDATE projects SET deleted_at = CURRENT_TIMESTAMP WHERE slug = ?").run("first");

    expect(() =>
      db
        .prepare(
          "INSERT INTO projects (slug, title, type, roles_json, size, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .run("second", "Второй", "Фестиваль", "[]", "standard", 0),
    ).not.toThrow();
  });
});
