// @vitest-environment node

import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { getAdminConfig } from "@/lib/admin/config";
import { closeDatabaseForTests, openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import { seedCurrentContent } from "@/lib/content/seed";
import { listAudit } from "@/lib/audit/repository";
import { purgeExpiredDeletedContent, restoreAuditEntry } from "@/lib/audit/restore";
import {
  reorderPersonnel,
  softDeletePersonnel,
  updatePersonnel,
} from "@/lib/content/personnel-service";
import { listPersonnel } from "@/lib/content/repository";

afterEach(() => closeDatabaseForTests());

function ctx() {
  const dataDir = mkdtempSync(join(tmpdir(), "event-crew-audit-"));
  const db = openDatabase(
    getAdminConfig({
      NODE_ENV: "test",
      EVENT_CREW_DATA_DIR: dataDir,
      SESSION_SECRET: "6".repeat(64),
    }),
  );
  runMigrations(db);
  seedCurrentContent(db);
  const actorId = Number(
    db.prepare("INSERT INTO users(username,password_hash)VALUES('o','x')").run().lastInsertRowid,
  );
  return { db, actorId };
}

describe("audit restoration", () => {
  test("maps restoration metadata and keeps legacy restore rows readable", () => {
    const { db, actorId } = ctx();
    const item = listPersonnel({ db })[0];
    updatePersonnel(
      item.id,
      { ...item, price: item.price + 100, mediaId: item.mediaId! },
      actorId,
      { db },
    );
    const entry = listAudit({ entityType: "personnel" }, { db })[0];

    expect(entry).toMatchObject({
      restoredAt: null,
      restoredByUserId: null,
      restoredByUsername: null,
      restoredFrom: null,
      restorable: true,
    });

    db.prepare(
      "UPDATE audit_log SET restored_at=?, restored_by_user_id=?, restored_from_json=? WHERE id=?",
    ).run("2026-11-01 12:00:00", actorId, JSON.stringify(entry.after), entry.id);
    db.prepare(
      `INSERT INTO audit_log(entity_type,entity_id,action,before_json,after_json,user_id)
       VALUES('personnel',?,'restore',?,?,?)`,
    ).run(String(item.id), JSON.stringify(entry.after), JSON.stringify(entry.before), actorId);

    const rows = listAudit({ entityType: "personnel" }, { db });
    const restored = rows.find(({ id }) => id === entry.id);
    const legacy = rows.find(({ action }) => action === "restore");
    expect(restored).toMatchObject({
      restoredAt: "2026-11-01 12:00:00",
      restoredByUserId: actorId,
      restoredByUsername: "o",
      restoredFrom: entry.after,
      restorable: false,
    });
    expect(legacy).toMatchObject({ action: "restore", restoredAt: null, restorable: false });
  });

  test("restores an update by marking the original audit entry", () => {
    const { db, actorId } = ctx();
    const item = listPersonnel({ db })[0];
    updatePersonnel(
      item.id,
      {
        name: item.name,
        description: item.description,
        price: item.price + 100,
        mediaId: item.mediaId!,
        alt: item.alt,
      },
      actorId,
      { db },
    );
    const entry = listAudit({ entityType: "personnel" }, { db })[0];
    expect(entry.before).toMatchObject({ price: item.price });
    const countBefore = (db.prepare("SELECT COUNT(*) count FROM audit_log").get() as { count: number })
      .count;
    const result = restoreAuditEntry(entry.id, actorId, { db });
    expect(result).toEqual({ ok: true, data: { restoredEntryId: entry.id } });
    expect(listPersonnel({ db })[0].price).toBe(item.price);
    expect(
      (db.prepare("SELECT COUNT(*) count FROM audit_log").get() as { count: number }).count,
    ).toBe(countBefore);
    expect(listAudit({ entityType: "personnel" }, { db })[0]).toMatchObject({
      id: entry.id,
      restoredByUserId: actorId,
      restoredByUsername: "o",
      restoredFrom: { price: item.price + 100 },
      restorable: false,
    });
    expect(restoreAuditEntry(entry.id, actorId, { db })).toEqual({
      ok: false,
      message: "Запись уже восстановлена",
    });
  });

  test("keeps restored history readable after the restoring user is deleted", () => {
    const { db, actorId } = ctx();
    const item = listPersonnel({ db })[0];
    updatePersonnel(
      item.id,
      { ...item, price: item.price + 100, mediaId: item.mediaId! },
      actorId,
      { db },
    );
    const entry = listAudit({ entityType: "personnel" }, { db })[0];
    expect(restoreAuditEntry(entry.id, actorId, { db }).ok).toBe(true);

    db.prepare("DELETE FROM users WHERE id=?").run(actorId);

    expect(listAudit({ entityType: "personnel" }, { db })[0]).toMatchObject({
      restoredAt: expect.any(String),
      restoredByUserId: null,
      restoredByUsername: null,
      restorable: false,
    });
  });

  test("restores deletion and list ordering", () => {
    const { db, actorId } = ctx();
    const items = listPersonnel({ db });
    softDeletePersonnel(items[0].id, actorId, { db });
    const deletion = listAudit({ action: "delete" }, { db })[0];
    restoreAuditEntry(deletion.id, actorId, { db });
    expect(listPersonnel({ db }).some(({ id }) => id === items[0].id)).toBe(true);
    const reversed = listPersonnel({ db })
      .map(({ id }) => id)
      .reverse();
    reorderPersonnel(reversed, actorId, { db });
    restoreAuditEntry(listAudit({ entityType: "personnel-list" }, { db })[0].id, actorId, {
      db,
    });
    expect(listPersonnel({ db }).map(({ id }) => id)).not.toEqual(reversed);
  });

  test("rejects expired restoration and purges expired deletes", () => {
    const { db, actorId } = ctx();
    const item = listPersonnel({ db })[0];
    updatePersonnel(item.id, { ...item, price: item.price + 1, mediaId: item.mediaId! }, actorId, {
      db,
    });
    const entry = listAudit({ entityType: "personnel" }, { db })[0];
    db.prepare("UPDATE audit_log SET created_at='2020-01-01' WHERE id=?").run(entry.id);
    expect(restoreAuditEntry(entry.id, actorId, { db }).ok).toBe(false);
    expect(listAudit({ entityType: "personnel" }, { db })[0]).toMatchObject({
      restoredAt: null,
      restoredByUserId: null,
      restoredFrom: null,
    });
    softDeletePersonnel(item.id, actorId, { db });
    db.prepare("UPDATE personnel SET deleted_at='2020-01-01' WHERE id=?").run(item.id);
    const report = purgeExpiredDeletedContent(new Date("2026-10-28"), { db });
    expect(report.personnel).toBe(1);
    expect(listPersonnel({ db, includeDeleted: true }).some(({ id }) => id === item.id)).toBe(
      false,
    );
  });

  test("leaves content and metadata unchanged when required media is unavailable", () => {
    const { db, actorId } = ctx();
    const items = listPersonnel({ db });
    const original = items[0];
    updatePersonnel(
      original.id,
      { ...original, price: original.price + 50, mediaId: items[1].mediaId! },
      actorId,
      { db },
    );
    const entry = listAudit({ entityType: "personnel" }, { db })[0];
    db.prepare("UPDATE media_assets SET deleted_at=CURRENT_TIMESTAMP WHERE id=?").run(
      original.mediaId,
    );

    expect(restoreAuditEntry(entry.id, actorId, { db })).toMatchObject({ ok: false });
    expect(listPersonnel({ db })[0]).toMatchObject({
      price: original.price + 50,
      mediaId: items[1].mediaId,
    });
    expect(listAudit({ entityType: "personnel" }, { db })[0]).toMatchObject({
      restoredAt: null,
      restoredByUserId: null,
      restoredFrom: null,
    });
  });
});
