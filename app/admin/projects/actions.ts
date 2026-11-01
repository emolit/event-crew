"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeAdminAction } from "@/lib/admin/authorize-action";
import type { ProjectInput } from "@/lib/admin/project-schema";
import { createProject, reorderProjects, softDeleteProject, updateProject } from "@/lib/content/project-service";
import { listProjects } from "@/lib/content/repository";
import { discardMedia, storeImage } from "@/lib/media/store";

export async function createProjectAction(formData: FormData): Promise<void> {
  const auth = await authorizeAdminAction(); if (!auth.ok) return;
  const uploaded:string[]=[];
  try { const input = await projectInputFromForm(formData,uploaded); createProject(input, auth.data.id); }
  catch(error){await Promise.all(uploaded.map(id=>discardMedia(id)));throw error;}
  revalidatePath("/"); revalidatePath("/admin/projects"); redirect("/admin/projects");
}

export async function updateProjectAction(id: number, formData: FormData): Promise<void> {
  const auth = await authorizeAdminAction(); if (!auth.ok) return;
  const uploaded:string[]=[];
  try { updateProject(id, await projectInputFromForm(formData,uploaded), auth.data.id); }
  catch(error){await Promise.all(uploaded.map(mediaId=>discardMedia(mediaId)));throw error;}
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

async function projectInputFromForm(formData: FormData, createdIds:string[]): Promise<ProjectInput> {
  const existing = JSON.parse(String(formData.get("existingImages") || "[]")) as ProjectInput["images"];
  const uploaded: ProjectInput["images"] = [];
  const files=formData.getAll("images").filter((value):value is File=>value instanceof File&&value.size>0);if(files.length>4||files.reduce((sum,file)=>sum+file.size,0)>48*1024*1024)throw new Error("Можно загрузить не более 4 фотографий общим размером до 48 МБ");
  for (const value of files) { const asset = await storeImage(Buffer.from(await value.arrayBuffer()), "project", value.name);createdIds.push(asset.id); uploaded.push({ mediaId: asset.id, alt: String(formData.get("title") || "Фотография проекта") }); }
  return { title: String(formData.get("title") || ""), type: String(formData.get("type") || ""), roles: String(formData.get("roles") || "").split(",").map((role) => role.trim()).filter(Boolean), detailTitle: String(formData.get("detailTitle") || ""), description: String(formData.get("description") || ""), size: String(formData.get("size") || "standard") as ProjectInput["size"], images: [...existing, ...uploaded] };
}
