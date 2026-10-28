// @vitest-environment node

import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { GET } from "@/app/media/[id]/route";
import { getAdminConfig } from "@/lib/admin/config";
import { closeDatabaseForTests, openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import { storeImage } from "@/lib/media/store";

let dataDir: string;

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), "event-crew-route-media-"));
  process.env.EVENT_CREW_DATA_DIR = dataDir;
  process.env.SESSION_SECRET = "1".repeat(64);
  closeDatabaseForTests();
});

afterEach(() => {
  closeDatabaseForTests();
  delete process.env.EVENT_CREW_DATA_DIR;
  delete process.env.SESSION_SECRET;
});

describe("public media route", () => {
  test("returns active media with immutable caching and an ETag", async () => {
    const input = await sharp({
      create: { width: 20, height: 15, channels: 3, background: { r: 4, g: 5, b: 6 } },
    }).png().toBuffer();
    const asset = await storeImage(input, "project", "event.png");

    const response = await GET(new Request(`http://localhost/media/${asset.id}`), {
      params: Promise.resolve({ id: asset.id }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("cache-control")).toContain("immutable");
    expect(response.headers.get("etag")).toMatch(/^"[a-f0-9]+"$/);
    expect((await response.arrayBuffer()).byteLength).toBe(asset.sizeBytes);
  });

  test("does not expose staged assets or accept traversal-shaped identifiers", async () => {
    const config = getAdminConfig();
    const db = openDatabase(config);
    runMigrations(db);
    const id = "11111111-1111-4111-8111-111111111111";
    writeFileSync(join(config.uploadsDir, `${id}.webp`), Buffer.from("private"));
    db.prepare(
      `INSERT INTO media_assets
       (id, filename, original_name, mime_type, width, height, size_bytes, profile, status)
       VALUES (?, ?, ?, 'image/webp', 1, 1, 7, 'project', 'staged')`,
    ).run(id, `${id}.webp`, "private.webp");

    const staged = await GET(new Request(`http://localhost/media/${id}`), {
      params: Promise.resolve({ id }),
    });
    const traversal = await GET(new Request("http://localhost/media/..%2Fsecret"), {
      params: Promise.resolve({ id: "../secret" }),
    });

    expect(staged.status).toBe(404);
    expect(traversal.status).toBe(404);
  });
});
