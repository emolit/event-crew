"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeAdminAction } from "@/lib/admin/authorize-action";
import type { ProjectInput } from "@/lib/admin/project-schema";
import { createProject, reorderProjects, softDeleteProject, updateProject } from "@/lib/content/project-service";
import { listProjects } from "@/lib/content/repository";
import { storeImage } from "@/lib/media/store";

export async function createProjectAction(formData: FormData): Promise<void> {
  const auth = await authorizeAdminAction(); if (!auth.ok) return;
  const input = await projectInputFromForm(formData);
  createProject(input, auth.data.id);
  revalidatePath("/"); revalidatePath("/admin/projects"); redirect("/admin/projects");
}

export async function updateProjectAction(id: number, formData: FormData): Promise<void> {
  const auth = await authorizeAdminAction(); if (!auth.ok) return;
  updateProject(id, await projectInputFromForm(formData), auth.data.id);
  revalidatePath("/"); revalidatePath("/admin/projects"); redirect("/admin/projects");
}

export async function deleteProjectAction(id: number): Promise<void> {
  const auth = await authorizeAdminAction(); if (!auth.ok) return;
  softDeleteProject(id, auth.data.id); revalidatePath("/"); revalidatePath("/admin/projects");
}

export async function moveProjectAction(id: number, direction: -1 | 1): Promise<void> {
  const auth = await authorizeAdminAction(); if (!auth.ok) return;
  const ids = listProjects().map((project) => project.id); const index = ids.indexOf(id); const target = index + direction;
  if (index < 0 || target < 0 || target >= ids.length) return;
  [ids[index], ids[target]] = [ids[target], ids[index]]; reorderProjects(ids, auth.data.id); revalidatePath("/"); revalidatePath("/admin/projects");
}

async function projectInputFromForm(formData: FormData): Promise<ProjectInput> {
  const existing = JSON.parse(String(formData.get("existingImages") || "[]")) as ProjectInput["images"];
  const uploaded: ProjectInput["images"] = [];
  for (const value of formData.getAll("images")) if (value instanceof File && value.size) { const asset = await storeImage(Buffer.from(await value.arrayBuffer()), "project", value.name); uploaded.push({ mediaId: asset.id, alt: String(formData.get("title") || "Фотография проекта") }); }
  return { title: String(formData.get("title") || ""), type: String(formData.get("type") || ""), roles: String(formData.get("roles") || "").split(",").map((role) => role.trim()).filter(Boolean), detailTitle: String(formData.get("detailTitle") || ""), description: String(formData.get("description") || ""), size: String(formData.get("size") || "standard") as ProjectInput["size"], images: [...existing, ...uploaded] };
}
