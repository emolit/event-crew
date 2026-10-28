import { createHash } from "node:crypto";
import { extname } from "node:path";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { initialClients, initialFooter, initialHomepage } from "@/data/site";
import type { Database } from "@/lib/db/client";

export function seedCurrentContent(db: Database): void {
  const seeded = db.prepare("SELECT 1 FROM site_content WHERE id = 1").get();
  if (seeded) return;

  db.exec("BEGIN IMMEDIATE");
  try {
    const heroMediaId = ensureStaticMedia(db, initialHomepage.heroImage, "hero");
    db.prepare(
      `INSERT INTO site_content (
        id, eyebrow, title, subtitle, primary_button_text, primary_button_href,
        secondary_button_text, secondary_button_href, hero_media_id
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      initialHomepage.eyebrow,
      initialHomepage.title,
      initialHomepage.subtitle,
      initialHomepage.primaryButtonText,
      initialHomepage.primaryButtonHref,
      initialHomepage.secondaryButtonText,
      initialHomepage.secondaryButtonHref,
      heroMediaId,
    );

    db.prepare(
      "INSERT INTO footer_content (id, contacts_json, promotion_json, copyright_text) VALUES (1, ?, ?, ?)",
    ).run(
      JSON.stringify(initialFooter.contacts),
      JSON.stringify(initialFooter.promotion),
      initialFooter.copyrightText,
    );

    const insertProject = db.prepare(
      `INSERT INTO projects (slug, title, type, roles_json, detail_title, description, size, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const insertProjectImage = db.prepare(
      "INSERT INTO project_images (project_id, media_id, alt, sort_order) VALUES (?, ?, ?, ?)",
    );
    projects.forEach((project, projectIndex) => {
      const result = insertProject.run(
        project.id,
        project.title,
        project.type,
        JSON.stringify(project.roles),
        project.detailTitle ?? null,
        project.description ?? null,
        project.size,
        projectIndex,
      );
      const images = project.images ?? [project.image];
      images.forEach((path, imageIndex) => {
        const mediaId = ensureStaticMedia(db, path, "project");
        insertProjectImage.run(Number(result.lastInsertRowid), mediaId, project.alt, imageIndex);
      });
    });

    const insertPersonnel = db.prepare(
      `INSERT INTO personnel (slug, name, description, price, media_id, alt, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    services.forEach((service, index) => {
      const mediaId = ensureStaticMedia(db, service.image, "personnel");
      insertPersonnel.run(
        service.id,
        service.name,
        service.description,
        service.price,
        mediaId,
        service.alt,
        index,
      );
    });

    const insertClient = db.prepare(
      `INSERT INTO clients (name, media_id, alt, website_url, sort_order, is_visible)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    initialClients.forEach((client, index) => {
      const mediaId = ensureStaticMedia(db, client.logo, "client");
      insertClient.run(client.name, mediaId, client.alt, client.websiteUrl, index, client.visible ? 1 : 0);
    });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function ensureStaticMedia(
  db: Database,
  publicPath: string,
  profile: "project" | "personnel" | "hero" | "client",
): string {
  const id = `static-${createHash("sha256").update(publicPath).digest("hex").slice(0, 24)}`;
  const extension = extname(publicPath).toLowerCase();
  const mimeType = extension === ".png" ? "image/png" : extension === ".jpg" || extension === ".jpeg" ? "image/jpeg" : "image/webp";
  db.prepare(
    `INSERT OR IGNORE INTO media_assets
      (id, filename, original_name, mime_type, width, height, size_bytes, profile, status)
     VALUES (?, ?, ?, ?, 1, 1, 1, ?, 'active')`,
  ).run(id, publicPath, publicPath.split("/").at(-1) ?? publicPath, mimeType, profile);
  return id;
}
