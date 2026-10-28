// @vitest-environment node

import { mkdtemp, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { getAdminConfig } from "@/lib/admin/config";
import { closeDatabaseForTests, openDatabase } from "@/lib/db/client";

afterEach(() => {
  closeDatabaseForTests();
});

describe("admin configuration", () => {
  test("uses a repository-local data directory only in development", () => {
    const config = getAdminConfig({ NODE_ENV: "development" });

    expect(config.dataDir).toBe(resolve(".data"));
    expect(config.databasePath).toBe(resolve(".data", "event-crew.sqlite"));
    expect(config.uploadsDir).toBe(resolve(".data", "uploads"));
    expect(config.backupsDir).toBe(resolve(".data", "backups"));
    expect(config.sessionSecret).toHaveLength(64);
    expect(config.isProduction).toBe(false);
  });

  const invalidProductionCases: Array<[NodeJS.ProcessEnv, string]> = [
    [{ NODE_ENV: "production", SESSION_SECRET: "a".repeat(64) }, "EVENT_CREW_DATA_DIR"],
    [{ NODE_ENV: "production", EVENT_CREW_DATA_DIR: "/var/lib/event-crew" }, "SESSION_SECRET"],
    [
      {
        NODE_ENV: "production",
        EVENT_CREW_DATA_DIR: "/var/lib/event-crew",
        SESSION_SECRET: "too-short",
      },
      "SESSION_SECRET",
    ],
  ];

  test.each(invalidProductionCases)("rejects incomplete production configuration %#", (env, expectedName) => {
    expect(() => getAdminConfig(env)).toThrow(expectedName);
  });

  test("creates the persistent directory tree before opening the database", async () => {
    const root = await mkdtemp(join(tmpdir(), "event-crew-config-"));
    const dataDir = join(root, "state");
    const config = getAdminConfig({
      NODE_ENV: "test",
      EVENT_CREW_DATA_DIR: dataDir,
      SESSION_SECRET: "b".repeat(64),
    });

    openDatabase(config);

    await expect(stat(dataDir)).resolves.toMatchObject({ mode: expect.any(Number) });
    await expect(stat(config.uploadsDir)).resolves.toMatchObject({ mode: expect.any(Number) });
    await expect(stat(config.backupsDir)).resolves.toMatchObject({ mode: expect.any(Number) });
  });
});
