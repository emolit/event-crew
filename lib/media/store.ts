import { randomUUID } from "node:crypto";
import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import sharp, { type Metadata, type Sharp } from "sharp";
import { getAdminConfig } from "@/lib/admin/config";
import type { Database } from "@/lib/db/client";
import { openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import type { MediaAsset, MediaProfile, MediaStoreContext } from "@/lib/media/types";

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export async function storeImage(
  input: Buffer,
  profile: MediaProfile,
  originalName: string,
  context: MediaStoreContext = {},
): Promise<MediaAsset> {
  if (input.length > MAX_UPLOAD_BYTES) {
    throw new Error("Размер изображения не должен превышать 12 МБ");
  }

  let pipeline: Sharp;
  let sourceMetadata: Metadata;
  try {
    pipeline = sharp(input, { failOn: "error", limitInputPixels: 80_000_000 });
    sourceMetadata = await pipeline.metadata();
  } catch {
    throw new Error("Файл не удалось распознать как изображение");
  }
  if (!sourceMetadata.format || !["jpeg", "png", "webp"].includes(sourceMetadata.format)) {
    throw new Error("Поддерживаются только JPEG, PNG или WebP");
  }

  const maxDimension = profile === "project" || profile === "hero" ? 2400 : 1600;
  const output = await pipeline
    .rotate()
    .resize({ width: maxDimension, height: maxDimension, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 100, effort: 5 })
    .toBuffer({ resolveWithObject: true });

  const config = context.config ?? getAdminConfig();
  const db = context.db ?? mediaDatabase(config);
  const id = randomUUID();
  const filename = `${id}.webp`;
  const stagingDir = resolve(config.uploadsDir, ".staging");
  const stagedPath = resolve(stagingDir, filename);
  const finalPath = resolve(config.uploadsDir, filename);
  await mkdir(stagingDir, { recursive: true, mode: 0o700 });

  try {
    await writeFile(stagedPath, output.data, { flag: "wx", mode: 0o600 });
    await rename(stagedPath, finalPath);
    db.prepare(
      `INSERT INTO media_assets
       (id, filename, original_name, mime_type, width, height, size_bytes, profile, status)
       VALUES (?, ?, ?, 'image/webp', ?, ?, ?, ?, 'active')`,
    ).run(
      id,
      filename,
      basename(originalName).slice(0, 255) || "image",
      output.info.width,
      output.info.height,
      output.data.length,
      profile,
    );
  } catch (error) {
    await Promise.all([unlink(stagedPath).catch(() => undefined), unlink(finalPath).catch(() => undefined)]);
    throw error;
  }

  return {
    id,
    filename,
    originalName: basename(originalName).slice(0, 255) || "image",
    mimeType: "image/webp",
    width: output.info.width,
    height: output.info.height,
    sizeBytes: output.data.length,
    profile,
    status: "active",
    url: mediaUrl(id),
  };
}

export function getMediaAsset(id: string, context: MediaStoreContext = {}): MediaAsset | null {
  if (!UUID_PATTERN.test(id)) {
    return null;
  }
  const config = context.config ?? getAdminConfig();
  const db = context.db ?? mediaDatabase(config);
  const row = db
    .prepare(
      `SELECT id, filename, original_name, mime_type, width, height, size_bytes, profile, status
       FROM media_assets WHERE id = ? AND status = 'active' AND deleted_at IS NULL`,
    )
    .get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    id: String(row.id),
    filename: String(row.filename),
    originalName: String(row.original_name),
    mimeType: "image/webp",
    width: Number(row.width),
    height: Number(row.height),
    sizeBytes: Number(row.size_bytes),
    profile: row.profile as MediaProfile,
    status: row.status as MediaAsset["status"],
    url: mediaUrl(String(row.id)),
  };
}

export async function discardMedia(id: string, context: MediaStoreContext = {}): Promise<void> {
  if (!UUID_PATTERN.test(id)) return;
  const config = context.config ?? getAdminConfig();
  const db = context.db ?? mediaDatabase(config);
  db.prepare(
    "UPDATE media_assets SET status = 'orphaned', deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND filename NOT LIKE '/%'",
  ).run(id);
}

export function mediaUrl(id: string): string {
  return `/media/${encodeURIComponent(id)}`;
}

function mediaDatabase(config = getAdminConfig()): Database {
  const db = openDatabase(config);
  runMigrations(db);
  return db;
}
