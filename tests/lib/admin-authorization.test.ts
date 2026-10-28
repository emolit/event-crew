// @vitest-environment node

import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { getAdminConfig } from "@/lib/admin/config";
import { authorizeAdminUser } from "@/lib/admin/authorize-action";
import { getAdminOverview } from "@/lib/admin/overview";
import { seedCurrentContent } from "@/lib/content/seed";
import { closeDatabaseForTests, openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";

afterEach(() => closeDatabaseForTests());

describe("admin action authorization", () => {
  test("rejects direct mutation authorization without a session user", () => {
    expect(authorizeAdminUser(null)).toEqual({ ok: false, message: "Требуется вход в админ-панель" });
  });

  test("returns the authenticated owner to an action", () => {
    const owner = { id: 7, username: "ivan", role: "owner" as const };
    expect(authorizeAdminUser(owner)).toEqual({ ok: true, data: owner });
  });
});

describe("admin overview", () => {
  test("reports active collection counts and recent changes", () => {
    const dataDir = mkdtempSync(join(tmpdir(), "event-crew-overview-"));
    const db = openDatabase(
      getAdminConfig({ NODE_ENV: "test", EVENT_CREW_DATA_DIR: dataDir, SESSION_SECRET: "2".repeat(64) }),
    );
    runMigrations(db);
    seedCurrentContent(db);
    db.prepare(
      "INSERT INTO audit_log (entity_type, entity_id, action, after_json) VALUES ('project', '1', 'update', '{}')",
    ).run();

    const overview = getAdminOverview({ db });

    expect(overview).toMatchObject({ projectCount: 5, personnelCount: 8, clientCount: 1 });
    expect(overview.recentChanges).toHaveLength(1);
    expect(overview.recentChanges[0]).toMatchObject({ entityType: "project", action: "update" });
  });
});
