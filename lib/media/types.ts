import type { AdminConfig } from "@/lib/admin/config";
import type { Database } from "@/lib/db/client";

export type MediaProfile = "project" | "personnel" | "hero" | "client";

export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: "image/webp";
  width: number;
  height: number;
  sizeBytes: number;
  profile: MediaProfile;
  status: "active" | "staged" | "orphaned";
  url: string;
}

export interface MediaStoreContext {
  db?: Database;
  config?: AdminConfig;
}
