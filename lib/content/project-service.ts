import type { Database } from "@/lib/db/client";
import { openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import { projectInputSchema, type ProjectInput } from "@/lib/admin/project-schema";
import { recordAudit } from "@/lib/audit/types";
import { listProjects } from "@/lib/content/repository";
import type { ProjectRecord } from "@/lib/content/types";

interface ServiceOptions { db?: Database }

export function createProject(input: ProjectInput, actorId: number, options: ServiceOptions = {}): ProjectRecord {
  const parsed = projectInputSchema.parse(input);
  const db = options.db ?? serviceDatabase();
  return transaction(db, () => {
    const slug = uniqueSlug(db, slugify(parsed.title));
    const order = Number((db.prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS value FROM projects WHERE deleted_at IS NULL").get() as { value: number }).value);
    const result = db.prepare(
      `INSERT INTO projects (slug, title, type, roles_json, detail_title, description, size, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(slug, parsed.title, parsed.type, JSON.stringify(parsed.roles), parsed.detailTitle, parsed.description, parsed.size, order);
    const id = Number(result.lastInsertRowid);
    replaceImages(db, id, parsed.images);
    const created = requireProject(db, id);
    recordAudit(db, { entityType: "project", entityId: id, action: "create", before: null, after: created, userId: actorId });
    return created;
  });
}

export function updateProject(id: number, input: ProjectInput, actorId: number, options: ServiceOptions = {}): ProjectRecord {
  const parsed = projectInputSchema.parse(input);
  const db = options.db ?? serviceDatabase();
  return transaction(db, () => {
    const before = requireProject(db, id);
    const changed = db.prepare(
      `UPDATE projects SET title = ?, type = ?, roles_json = ?, detail_title = ?, description = ?, size = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL`,
    ).run(parsed.title, parsed.type, JSON.stringify(parsed.roles), parsed.detailTitle, parsed.description, parsed.size, id);
    if (!changed.changes) throw new Error("Проект не найден");
    replaceImages(db, id, parsed.images);
    const after = requireProject(db, id);
    recordAudit(db, { entityType: "project", entityId: id, action: "update", before, after, userId: actorId });
    return after;
  });
}

export function softDeleteProject(id: number, actorId: number, options: ServiceOptions = {}): void {
  const db = options.db ?? serviceDatabase();
  transaction(db, () => {
    const before = requireProject(db, id);
    db.prepare("UPDATE projects SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
    compactProjectOrder(db);
    recordAudit(db, { entityType: "project", entityId: id, action: "delete", before, after: null, userId: actorId });
  });
}

export function reorderProjects(ids: number[], actorId: number, options: ServiceOptions = {}): void {
  const db = options.db ?? serviceDatabase();
  transaction(db, () => {
    const active = listProjects({ db });
    validateExactOrder(ids, active.map(({ id }) => id), "Некорректный порядок проектов");
    const before = active.map(({ id }) => id);
    db.exec("UPDATE projects SET sort_order = sort_order + 100000 WHERE deleted_at IS NULL");
    const update = db.prepare("UPDATE projects SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL");
    ids.forEach((id, index) => update.run(index, id));
    recordAudit(db, { entityType: "project-list", entityId: "all", action: "reorder", before, after: ids, userId: actorId });
  });
}

export function reorderProjectImages(projectId: number, ids: number[], actorId: number, options: ServiceOptions = {}): void {
  const db = options.db ?? serviceDatabase();
  transaction(db, () => {
    const project = requireProject(db, projectId);
    const current = project.images.map(({ id }) => id);
    const before = project.images;
    validateExactOrder(ids, current, "Некорректный порядок галереи");
    db.prepare("UPDATE project_images SET sort_order = sort_order + 100000 WHERE project_id = ? AND deleted_at IS NULL").run(projectId);
    const update = db.prepare("UPDATE project_images SET sort_order = ? WHERE id = ? AND project_id = ? AND deleted_at IS NULL");
    ids.forEach((id, index) => update.run(index, id, projectId));
    const after = requireProject(db, projectId).images;
    recordAudit(db, { entityType: "project-gallery", entityId: projectId, action: "reorder", before, after, userId: actorId });
  });
}

function replaceImages(db: Database, projectId: number, images: ProjectInput["images"]): void {
  db.prepare("UPDATE project_images SET deleted_at = CURRENT_TIMESTAMP WHERE project_id = ? AND deleted_at IS NULL").run(projectId);
  const insert = db.prepare("INSERT INTO project_images (project_id, media_id, alt, sort_order) VALUES (?, ?, ?, ?)");
  images.forEach((image, index) => insert.run(projectId, image.mediaId, image.alt, index));
}

function compactProjectOrder(db: Database): void {
  const ids = (db.prepare("SELECT id FROM projects WHERE deleted_at IS NULL ORDER BY sort_order, id").all() as Array<{ id: number }>).map(({ id }) => id);
  db.exec("UPDATE projects SET sort_order = sort_order + 100000 WHERE deleted_at IS NULL");
  const update = db.prepare("UPDATE projects SET sort_order = ? WHERE id = ?");
  ids.forEach((id, index) => update.run(index, id));
}

function requireProject(db: Database, id: number): ProjectRecord {
  const project = listProjects({ db, includeDeleted: true }).find((candidate) => candidate.id === id && !candidate.deletedAt);
  if (!project) throw new Error("Проект не найден");
  return project;
}

function validateExactOrder(received: number[], expected: number[], message: string): void {
  if (received.length !== expected.length || new Set(received).size !== received.length || [...received].sort((a,b) => a-b).join(",") !== [...expected].sort((a,b) => a-b).join(",")) throw new Error(message);
}

function uniqueSlug(db: Database, base: string): string {
  let candidate = base || "project";
  let suffix = 2;
  while (db.prepare("SELECT 1 FROM projects WHERE slug = ?").get(candidate)) candidate = `${base || "project"}-${suffix++}`;
  return candidate;
}

function slugify(value: string): string {
  const pairs: Record<string,string> = { а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"i",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"ts",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya" };
  return value.toLocaleLowerCase("ru").split("").map((char) => pairs[char] ?? char).join("").normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

function transaction<T>(db: Database, operation: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try { const result = operation(); db.exec("COMMIT"); return result; }
  catch (error) { db.exec("ROLLBACK"); throw error; }
}

function serviceDatabase(): Database { const db = openDatabase(); runMigrations(db); return db; }
