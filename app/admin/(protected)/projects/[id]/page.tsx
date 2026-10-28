import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { updateProjectAction } from "@/app/admin/projects/actions";
import { listProjects } from "@/lib/content/repository";
export const dynamic="force-dynamic";
export default async function EditProjectPage({params}:{params:Promise<{id:string}>}){const {id}=await params; const project=listProjects().find((item)=>item.id===Number(id)); if(!project)notFound(); return <><h1 className="text-4xl font-black">{project.title}</h1><ProjectForm action={updateProjectAction.bind(null,project.id)} initial={project}/></>;}
