// @vitest-environment node

import { existsSync, mkdtempSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterEach, describe, expect, test } from "vitest";
import { getAdminConfig } from "@/lib/admin/config";
import { closeDatabaseForTests, openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import { getMediaAsset, mediaUrl, storeImage } from "@/lib/media/store";

afterEach(() => closeDatabaseForTests());

function mediaContext() {
  const dataDir = mkdtempSync(join(tmpdir(), "event-crew-media-"));
  const config = getAdminConfig({
    NODE_ENV: "test",
    EVENT_CREW_DATA_DIR: dataDir,
    SESSION_SECRET: "f".repeat(64),
  });
  const db = openDatabase(config);
  runMigrations(db);
  return { config, db };
}

async function image(format: "jpeg" | "png" | "webp", width = 40, height = 30, alpha = false) {
  const channels = alpha ? 4 : 3;
  const background = alpha ? { r: 230, g: 190, b: 20, alpha: 0.35 } : { r: 230, g: 190, b: 20 };
  return sharp({ create: { width, height, channels, background } })[format]().toBuffer();
}

describe("persistent media store", () => {
  test.each(["jpeg", "png", "webp"] as const)("accepts and rewrites %s as WebP", async (format) => {
    const context = mediaContext();
    const asset = await storeImage(await image(format), "project", `photo.${format}`, context);

    expect(asset.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(asset.filename).toMatch(/^[0-9a-f-]{36}\.webp$/);
    expect(asset.mimeType).toBe("image/webp");
    expect(asset.url).toBe(`/media/${asset.id}`);
    expect(getMediaAsset(asset.id, context)).toMatchObject(asset);
    expect(existsSync(join(context.config.uploadsDir, asset.filename))).toBe(true);
  });

  test("rejects oversized, invalid, and SVG input before permanent storage", async () => {
    const context = mediaContext();
    const oversized = Buffer.alloc(12 * 1024 * 1024 + 1);
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>');

    await expect(storeImage(oversized, "project", "huge.jpg", context)).rejects.toThrow("12 МБ");
    await expect(storeImage(Buffer.from("not an image"), "project", "fake.jpg", context)).rejects.toThrow("изображение");
    await expect(storeImage(svg, "client", "logo.svg", context)).rejects.toThrow("JPEG, PNG или WebP");
    expect(readdirSync(context.config.uploadsDir)).toEqual([]);
  });

  test("auto-rotates, limits dimensions, and preserves alpha for transparent profiles", async () => {
    const context = mediaContext();
    const oriented = await sharp({
      create: { width: 1200, height: 2000, channels: 3, background: { r: 1, g: 2, b: 3 } },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const transparent = await image("png", 2000, 1800, true);

    const hero = await storeImage(oriented, "hero", "hero.jpg", context);
    const person = await storeImage(transparent, "personnel", "person.png", context);
    const heroMetadata = await sharp(join(context.config.uploadsDir, hero.filename)).metadata();
    const personMetadata = await sharp(join(context.config.uploadsDir, person.filename)).metadata();

    expect(Math.max(heroMetadata.width ?? 0, heroMetadata.height ?? 0)).toBeLessThanOrEqual(2400);
    expect(heroMetadata.orientation).toBeUndefined();
    expect(Math.max(personMetadata.width ?? 0, personMetadata.height ?? 0)).toBe(1600);
    expect(personMetadata.hasAlpha).toBe(true);
  });

  test("removes the final file when the metadata insert fails", async () => {
    const context = mediaContext();
    context.db.exec("DROP TABLE media_assets");

    await expect(storeImage(await image("png"), "client", "logo.png", context)).rejects.toThrow();

    expect(readdirSync(context.config.uploadsDir, { recursive: true }).filter((name) => String(name).endsWith(".webp"))).toEqual([]);
  });

  test("serves stable URLs without exposing filesystem names", async () => {
    const context = mediaContext();
    const asset = await storeImage(await image("webp"), "project", "private-name.webp", context);
    const bytes = await readFile(join(context.config.uploadsDir, asset.filename));

    expect(mediaUrl(asset.id)).toBe(`/media/${asset.id}`);
    expect(bytes.length).toBe(asset.sizeBytes);
    expect(asset.url).not.toContain("private-name");
  });
});
