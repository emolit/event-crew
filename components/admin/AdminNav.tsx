"use client";

import Link from "next/link";
import { useState } from "react";

const items = [
  ["Обзор", "/admin", "◆"],
  ["Проекты", "/admin/projects", "▦"],
  ["Персонал", "/admin/personnel", "●"],
  ["Главный экран", "/admin/homepage", "T"],
  ["Футер", "/admin/footer", "⌁"],
  ["Клиенты", "/admin/clients", "◇"],
  ["История", "/admin/history", "↶"],
] as const;

export default function AdminNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        aria-controls="admin-navigation"
        aria-expanded={open}
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        className="fixed right-4 top-4 z-50 grid size-11 place-items-center rounded-lg bg-[color:var(--accent)] font-black text-black lg:hidden"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? "×" : "☰"}
      </button>
      <nav
        aria-label="Разделы админ-панели"
        className={`${open ? "flex" : "hidden"} fixed inset-0 z-40 flex-col bg-[#0e0e0d] px-5 pb-8 pt-20 lg:static lg:flex lg:min-h-[calc(100vh-73px)] lg:w-60 lg:border-r lg:border-white/10 lg:px-4 lg:pt-6`}
        id="admin-navigation"
      >
        <p className="mb-3 px-3 text-[0.65rem] font-black uppercase tracking-[0.16em] text-white/35">Управление</p>
        {items.map(([label, href, icon], index) => (
          <Link
            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition-colors hover:bg-white/10 ${index === 0 ? "bg-[color:var(--accent)] text-black" : "text-white/70"}`}
            href={href}
            key={href}
            onClick={() => setOpen(false)}
          >
            <span aria-hidden="true" className="w-5 text-center">{icon}</span>{label}
          </Link>
        ))}
      </nav>
    </>
  );
}
