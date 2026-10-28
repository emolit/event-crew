"use client";

import { useState } from "react";
import ProjectGalleryEditor from "@/components/admin/ProjectGalleryEditor";
import type { ProjectRecord } from "@/lib/content/types";

export default function ProjectForm({ action, initial }: { action: (formData: FormData) => void | Promise<void>; initial: ProjectRecord | null }) {
  const [images, setImages] = useState(initial?.images ?? []);
  const field = "mt-2 min-h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none focus:border-[color:var(--accent)]";
  return <form action={action} className="mt-7 grid max-w-3xl gap-5"><label className="text-sm font-bold">Название карточки<input className={field} defaultValue={initial?.title} name="title" required /></label><label className="text-sm font-bold">Тип мероприятия<input className={field} defaultValue={initial?.type} name="type" required /></label><label className="text-sm font-bold">Состав команды<input className={field} defaultValue={initial?.roles.join(", ")} name="roles" placeholder="Хелперы, Охрана" /></label><label className="text-sm font-bold">Заголовок описания<input className={field} defaultValue={initial?.detailTitle ?? ""} name="detailTitle" required /></label><label className="text-sm font-bold">Описание<textarea className={`${field} min-h-36`} defaultValue={initial?.description ?? ""} name="description" required /></label><label className="text-sm font-bold">Размер карточки<select className={field} defaultValue={initial?.size ?? "standard"} name="size"><option value="standard">Стандартная</option><option value="wide">Широкая</option><option value="tall">Высокая</option></select></label><input name="existingImages" type="hidden" value={JSON.stringify(images.map(({ mediaId, alt }) => ({ mediaId, alt })))} /><ProjectGalleryEditor images={images} onChange={setImages} /><button className="min-h-12 rounded-lg bg-[color:var(--accent)] px-5 text-sm font-black uppercase tracking-[0.08em] text-black" type="submit">Сохранить проект</button></form>;
}
