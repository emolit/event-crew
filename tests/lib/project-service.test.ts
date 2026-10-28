// @vitest-environment node

import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { getAdminConfig } from "@/lib/admin/config";
import { seedCurrentContent } from "@/lib/content/seed";
import { listProjects } from "@/lib/content/repository";
import { createProject, reorderProjectImages, reorderProjects, softDeleteProject, updateProject } from "@/lib/content/project-service";
import { closeDatabaseForTests, openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";

afterEach(() => closeDatabaseForTests());

function context() {
  const dataDir = mkdtempSync(join(tmpdir(), "event-crew-projects-"));
  const db = openDatabase(getAdminConfig({ NODE_ENV: "test", EVENT_CREW_DATA_DIR: dataDir, SESSION_SECRET: "3".repeat(64) }));
  runMigrations(db);
  seedCurrentContent(db);
  const passwordHash = "test-only";
  const actorId = Number(db.prepare("INSERT INTO users (username, password_hash) VALUES ('owner', ?)").run(passwordHash).lastInsertRowid);
  return { db, actorId };
}

describe("project service", () => {
  test("creates, updates, and softly deletes projects with unique stable slugs and audit entries", () => {
    const { db, actorId } = context();
    const mediaId = String((db.prepare("SELECT id FROM media_assets LIMIT 1").get() as { id: string }).id);
    const input = { title: "Новый проект", type: "Фестиваль", roles: ["Хелперы"], detailTitle: "Подробности", description: "Описание проекта", size: "wide" as const, images: [{ mediaId, alt: "Команда проекта" }] };

    const first = createProject(input, actorId, { db });
    const second = createProject(input, actorId, { db });
    updateProject(first.id, { ...input, title: "Обновлённый проект", roles: ["Хелперы", "Охрана"], size: "tall" }, actorId, { db });
    softDeleteProject(second.id, actorId, { db });

    expect(first.slug).toBe("novyi-proekt");
    expect(second.slug).toBe("novyi-proekt-2");
    expect(listProjects({ db }).find(({ id }) => id === first.id)).toMatchObject({ title: "Обновлённый проект", roles: ["Хелперы", "Охрана"], size: "tall" });
    expect(listProjects({ db }).some(({ id }) => id === second.id)).toBe(false);
    expect((db.prepare("SELECT COUNT(*) AS count FROM audit_log WHERE entity_type = 'project'").get() as { count: number }).count).toBe(4);
  });

  test("rolls back project and audit when an image relation is invalid", () => {
    const { db, actorId } = context();
    const beforeProjects = Number((db.prepare("SELECT COUNT(*) AS count FROM projects").get() as { count: number }).count);

    expect(() => createProject({ title: "Ошибка", type: "Событие", roles: [], detailTitle: "Ошибка", description: "Описание", size: "standard", images: [{ mediaId: "missing-media", alt: "Нет файла" }] }, actorId, { db })).toThrow();

    expect((db.prepare("SELECT COUNT(*) AS count FROM projects").get() as { count: number }).count).toBe(beforeProjects);
    expect((db.prepare("SELECT COUNT(*) AS count FROM audit_log").get() as { count: number }).count).toBe(0);
  });

  test("reorders projects atomically and rejects duplicate or incomplete ids", () => {
    const { db, actorId } = context();
    const original = listProjects({ db });
    const reversed = original.map(({ id }) => id).reverse();

    reorderProjects(reversed, actorId, { db });
    expect(listProjects({ db }).map(({ id }) => id)).toEqual(reversed);

    const stable = listProjects({ db }).map(({ id }) => id);
    expect(() => reorderProjects([stable[0], stable[0], ...stable.slice(2)], actorId, { db })).toThrow("порядок");
    expect(() => reorderProjects(stable.slice(1), actorId, { db })).toThrow("порядок");
    expect(listProjects({ db }).map(({ id }) => id)).toEqual(stable);
  });

  test("reorders only images belonging to the selected project and changes the cover", () => {
    const { db, actorId } = context();
    const project = listProjects({ db })[0];
    const reversed = project.images.map(({ id }) => id).reverse();

    reorderProjectImages(project.id, reversed, actorId, { db });
    expect(listProjects({ db })[0].images.map(({ id }) => id)).toEqual(reversed);

    const foreignImageId = listProjects({ db })[1].images[0].id;
    expect(() => reorderProjectImages(project.id, [foreignImageId, ...reversed.slice(1)], actorId, { db })).toThrow("галереи");
    expect(listProjects({ db })[0].images.map(({ id }) => id)).toEqual(reversed);
  });
});
