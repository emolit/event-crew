import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getAdminConfig } from "@/lib/admin/config";
import { getMediaAsset } from "@/lib/media/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { id } = await context.params;
  const asset = getMediaAsset(id);
  if (!asset || asset.filename.startsWith("/") || asset.filename !== `${id}.webp`) {
    return new Response("Not found", { status: 404 });
  }

  const config = getAdminConfig();
  const filePath = resolve(config.uploadsDir, asset.filename);
  if (!filePath.startsWith(`${resolve(config.uploadsDir)}\\`) && !filePath.startsWith(`${resolve(config.uploadsDir)}/`)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const bytes = await readFile(filePath);
    const etag = `"${createHash("sha256").update(`${asset.id}:${asset.sizeBytes}`).digest("hex")}"`;
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(bytes.length),
        "Content-Type": "image/webp",
        ETag: etag,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
