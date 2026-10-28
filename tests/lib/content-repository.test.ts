// @vitest-environment node

import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { initialClients, initialFooter, initialHomepage } from "@/data/site";
import { getAdminConfig } from "@/lib/admin/config";
import {
  getFooter,
  getHomepage,
  getPublicContent,
  listClients,
  listPersonnel,
  listProjects,
} from "@/lib/content/repository";
import { seedCurrentContent } from "@/lib/content/seed";
import { closeDatabaseForTests, openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";

afterEach(() => closeDatabaseForTests());

function seededDatabase() {
  const dataDir = mkdtempSync(join(tmpdir(), "event-crew-content-"));
  const db = openDatabase(
    getAdminConfig({
      NODE_ENV: "test",
      EVENT_CREW_DATA_DIR: dataDir,
      SESSION_SECRET: "e".repeat(64),
    }),
  );
  runMigrations(db);
  seedCurrentContent(db);
  return db;
}

describe("initial content seed", () => {
  test("imports every approved record and static asset exactly once", () => {
    const db = seededDatabase();

    seedCurrentContent(db);

    expect((db.prepare("SELECT COUNT(*) AS count FROM projects").get() as { count: number }).count).toBe(5);
    expect((db.prepare("SELECT COUNT(*) AS count FROM project_images").get() as { count: number }).count).toBe(13);
    expect((db.prepare("SELECT COUNT(*) AS count FROM personnel").get() as { count: number }).count).toBe(8);
    expect((db.prepare("SELECT COUNT(*) AS count FROM clients").get() as { count: number }).count).toBe(1);
    expect(listProjects({ db }).map((project) => project.title)).toEqual(projects.map(({ title }) => title));
    expect(listProjects({ db }).map((project) => project.roles)).toEqual(projects.map(({ roles }) => [...roles]));
    expect(listPersonnel({ db }).map(({ price }) => price)).toEqual(services.map(({ price }) => price));
    expect(getHomepage({ db })).toMatchObject(initialHomepage);
    expect(getFooter({ db })).toMatchObject(initialFooter);
    expect(listClients({ db })).toMatchObject(initialClients);
  });

  test("keeps gallery and collection order while excluding hidden or deleted content", () => {
    const db = seededDatabase();
    const before = listProjects({ db });
    expect(before[0].images.map(({ url }) => url)).toEqual(projects[0].images);

    db.exec("UPDATE projects SET sort_order = sort_order + 100");
    db.prepare("UPDATE projects SET sort_order = 0 WHERE slug = ?").run("project-05");
    db.prepare("UPDATE projects SET sort_order = 1 WHERE slug = ?").run("project-01");
    db.prepare("UPDATE projects SET deleted_at = CURRENT_TIMESTAMP WHERE slug = ?").run("project-02");
    db.prepare("UPDATE clients SET is_visible = 0").run();

    expect(listProjects({ db }).map(({ slug }) => slug)).toEqual(["project-05", "project-01", "project-06", "project-04"]);
    expect(listProjects({ db, includeDeleted: true })).toHaveLength(5);
    expect(listClients({ db })).toEqual([]);
    expect(listClients({ db, includeHidden: true })).toHaveLength(1);
  });

  test("returns one complete public-content snapshot", async () => {
    const db = seededDatabase();
    const content = await getPublicContent({ db });

    expect(content).toMatchObject({
      homepage: initialHomepage,
      footer: initialFooter,
    });
    expect(content.projects).toHaveLength(5);
    expect(content.personnel).toHaveLength(8);
    expect(content.clients).toHaveLength(1);
  });
});
