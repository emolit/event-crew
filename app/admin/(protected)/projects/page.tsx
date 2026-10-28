import Link from "next/link";
import { deleteProjectAction, moveProjectAction } from "@/app/admin/projects/actions";
import { listProjects } from "@/lib/content/repository";
import { seedCurrentContent } from "@/lib/content/seed";
import { openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";

export const dynamic = "force-dynamic";
export default function ProjectsAdminPage() { const db=openDatabase(); runMigrations(db); seedCurrentContent(db); const projects=listProjects({db}); return <><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-[color:var(--accent)]">Контент</p><h1 className="mt-2 text-4xl font-black">Проекты</h1></div><Link className="rounded-lg bg-[color:var(--accent)] px-4 py-3 text-sm font-black text-black" href="/admin/projects/new">Добавить проект</Link></div><ul className="mt-7 grid gap-3">{projects.map((project,index)=><li className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4" key={project.id}><span className="w-8 text-white/35">{index+1}</span><span className="min-w-48 flex-1 font-bold">{project.title}</span><form action={moveProjectAction.bind(null,project.id,-1)}><button aria-label={`Переместить ${project.title} вверх`} disabled={index===0}>↑</button></form><form action={moveProjectAction.bind(null,project.id,1)}><button aria-label={`Переместить ${project.title} вниз`} disabled={index===projects.length-1}>↓</button></form><Link className="rounded border border-white/20 px-3 py-2 text-sm" href={`/admin/projects/${project.id}`}>Изменить</Link><form action={deleteProjectAction.bind(null,project.id)}><button className="px-3 py-2 text-sm text-red-300">Удалить</button></form></li>)}</ul></>; }
