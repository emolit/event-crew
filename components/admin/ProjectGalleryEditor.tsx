"use client";

import type { ProjectImageRecord } from "@/lib/content/types";
import Image from "next/image";

export default function ProjectGalleryEditor({ images, onChange }: { images: ProjectImageRecord[]; onChange: (images: ProjectImageRecord[]) => void }) {
  return <div className="grid gap-4"><div className="grid gap-3 sm:grid-cols-2">{images.map((image) => <figure className="overflow-hidden rounded-lg border border-white/15 bg-black/20" key={image.id}><Image alt={image.alt} className="aspect-video w-full object-cover" height={270} src={image.url} unoptimized width={480} /><figcaption className="flex items-center justify-between gap-3 p-3 text-sm"><span className="truncate">{image.alt}</span><button aria-label={`Удалить фотографию ${image.alt}`} className="text-red-300" onClick={() => onChange(images.filter(({ id }) => id !== image.id))} type="button">Удалить</button></figcaption></figure>)}</div><label className="grid gap-2 text-sm font-bold">Добавить фотографии<input accept="image/jpeg,image/png,image/webp" aria-label="Добавить фотографии" className="block w-full rounded-lg border border-dashed border-white/25 p-4" multiple name="images" type="file" /></label></div>;
}
