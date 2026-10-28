import type { Database } from "@/lib/db/client";
import { openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import type {
  ClientRecord,
  FooterContent,
  HomepageContent,
  PersonnelRecord,
  ProjectImageRecord,
  ProjectRecord,
  PublicContent,
} from "@/lib/content/types";

interface RepositoryOptions {
  db?: Database;
  includeDeleted?: boolean;
}

interface ClientOptions extends RepositoryOptions {
  includeHidden?: boolean;
}

export function listProjects(options: RepositoryOptions = {}): ProjectRecord[] {
  const db = options.db ?? contentDatabase();
  const where = options.includeDeleted ? "" : "WHERE deleted_at IS NULL";
  const rows = db
    .prepare(
      `SELECT id, slug, title, type, roles_json, detail_title, description, size, sort_order, deleted_at
       FROM projects ${where} ORDER BY sort_order, id`,
    )
    .all() as Array<Record<string, unknown>>;
  const imageQuery = db.prepare(
    `SELECT project_images.id, project_images.media_id, media_assets.filename, project_images.alt,
            project_images.sort_order
     FROM project_images JOIN media_assets ON media_assets.id = project_images.media_id
     WHERE project_images.project_id = ? AND project_images.deleted_at IS NULL
     ORDER BY project_images.sort_order, project_images.id`,
  );

  return rows.map((row) => ({
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    type: String(row.type),
    roles: parseStringArray(String(row.roles_json)),
    detailTitle: nullableString(row.detail_title),
    description: nullableString(row.description),
    size: row.size as ProjectRecord["size"],
    sortOrder: Number(row.sort_order),
    deletedAt: nullableString(row.deleted_at),
    images: (imageQuery.all(Number(row.id)) as Array<Record<string, unknown>>).map(mapProjectImage),
  }));
}

export function listPersonnel(options: RepositoryOptions = {}): PersonnelRecord[] {
  const db = options.db ?? contentDatabase();
  const where = options.includeDeleted ? "" : "WHERE personnel.deleted_at IS NULL";
  const rows = db
    .prepare(
      `SELECT personnel.id, personnel.slug, personnel.name, personnel.description, personnel.price,
              personnel.media_id, media_assets.filename, personnel.alt, personnel.sort_order,
              personnel.deleted_at
       FROM personnel LEFT JOIN media_assets ON media_assets.id = personnel.media_id
       ${where} ORDER BY personnel.sort_order, personnel.id`,
    )
    .all() as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: String(row.description),
    price: Number(row.price),
    mediaId: nullableString(row.media_id),
    image: nullableString(row.filename),
    alt: String(row.alt),
    sortOrder: Number(row.sort_order),
    deletedAt: nullableString(row.deleted_at),
  }));
}

export function getHomepage(options: Pick<RepositoryOptions, "db"> = {}): HomepageContent {
  const db = options.db ?? contentDatabase();
  const row = db
    .prepare(
      `SELECT site_content.eyebrow, site_content.title, site_content.subtitle,
              site_content.primary_button_text, site_content.primary_button_href,
              site_content.secondary_button_text, site_content.secondary_button_href,
              site_content.hero_media_id, media_assets.filename
       FROM site_content LEFT JOIN media_assets ON media_assets.id = site_content.hero_media_id
       WHERE site_content.id = 1`,
    )
    .get() as Record<string, unknown> | undefined;
  if (!row) throw new Error("Homepage content is not seeded");
  return {
    eyebrow: String(row.eyebrow),
    title: String(row.title),
    subtitle: String(row.subtitle),
    primaryButtonText: String(row.primary_button_text),
    primaryButtonHref: String(row.primary_button_href),
    secondaryButtonText: String(row.secondary_button_text),
    secondaryButtonHref: String(row.secondary_button_href),
    heroMediaId: nullableString(row.hero_media_id),
    heroImage: nullableString(row.filename),
  };
}

export function getFooter(options: Pick<RepositoryOptions, "db"> = {}): FooterContent {
  const db = options.db ?? contentDatabase();
  const row = db
    .prepare("SELECT contacts_json, promotion_json, copyright_text FROM footer_content WHERE id = 1")
    .get() as { contacts_json: string; promotion_json: string; copyright_text: string } | undefined;
  if (!row) throw new Error("Footer content is not seeded");
  return {
    contacts: JSON.parse(row.contacts_json) as FooterContent["contacts"],
    promotion: JSON.parse(row.promotion_json) as FooterContent["promotion"],
    copyrightText: row.copyright_text,
  };
}

export function listClients(options: ClientOptions = {}): ClientRecord[] {
  const db = options.db ?? contentDatabase();
  const conditions: string[] = [];
  if (!options.includeDeleted) conditions.push("clients.deleted_at IS NULL");
  if (!options.includeHidden) conditions.push("clients.is_visible = 1");
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = db
    .prepare(
      `SELECT clients.id, clients.name, clients.media_id, media_assets.filename, clients.alt,
              clients.website_url, clients.sort_order, clients.is_visible, clients.deleted_at
       FROM clients JOIN media_assets ON media_assets.id = clients.media_id
       ${where} ORDER BY clients.sort_order, clients.id`,
    )
    .all() as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    mediaId: String(row.media_id),
    logo: String(row.filename),
    alt: String(row.alt),
    websiteUrl: String(row.website_url),
    sortOrder: Number(row.sort_order),
    visible: Number(row.is_visible) === 1,
    deletedAt: nullableString(row.deleted_at),
  }));
}

export async function getPublicContent(options: Pick<RepositoryOptions, "db"> = {}): Promise<PublicContent> {
  const db = options.db ?? contentDatabase();
  return {
    homepage: getHomepage({ db }),
    footer: getFooter({ db }),
    clients: listClients({ db }),
    projects: listProjects({ db }),
    personnel: listPersonnel({ db }),
  };
}

function contentDatabase(): Database {
  const db = openDatabase();
  runMigrations(db);
  return db;
}

function mapProjectImage(row: Record<string, unknown>): ProjectImageRecord {
  return {
    id: Number(row.id),
    mediaId: String(row.media_id),
    url: String(row.filename),
    alt: String(row.alt),
    sortOrder: Number(row.sort_order),
  };
}

function parseStringArray(value: string): string[] {
  const parsed = JSON.parse(value) as unknown;
  return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : [];
}

function nullableString(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}
