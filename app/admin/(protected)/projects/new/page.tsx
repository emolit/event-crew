import ProjectForm from "@/components/admin/ProjectForm";
import { createProjectAction } from "@/app/admin/projects/actions";
export default function NewProjectPage(){return <><h1 className="text-4xl font-black">Новый проект</h1><ProjectForm action={createProjectAction} initial={null}/></>;}
