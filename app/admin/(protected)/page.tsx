import Link from "next/link";
import { getAdminOverview } from "@/lib/admin/overview";
import { seedCurrentContent } from "@/lib/content/seed";
import { openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";

export const dynamic = "force-dynamic";

export default function AdminOverviewPage() {
  const db = openDatabase();
  runMigrations(db);
  seedCurrentContent(db);
  const overview = getAdminOverview({ db });
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--accent)]">EVENT CREW</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">Обзор</h1><p className="mt-2 text-white/50">Управление содержимым сайта.</p></div><Link className="rounded-lg bg-[color:var(--accent)] px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-black" href="/" target="_blank">Открыть сайт ↗</Link></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">{[[overview.projectCount,"проектов"],[overview.personnelCount,"видов персонала"],[overview.clientCount,"клиентов"]].map(([value,label]) => <div className="rounded-xl border border-white/10 bg-white/[0.055] p-5" key={label}><strong className="text-4xl font-black">{value}</strong><p className="mt-1 text-sm text-white/45">{label}</p></div>)}</div>
      <section className="mt-6 rounded-xl bg-[#f3f0e8] p-5 text-black"><div className="flex items-center justify-between"><h2 className="text-lg font-black">Последние изменения</h2><Link className="text-sm font-bold text-black/55" href="/admin/history">Вся история →</Link></div>{overview.recentChanges.length ? <ul className="mt-4 divide-y divide-black/10">{overview.recentChanges.map((change) => <li className="flex justify-between gap-4 py-3 text-sm" key={change.id}><span className="font-bold">{change.entityType} · {change.entityId}</span><span className="text-black/50">{change.action}</span></li>)}</ul> : <p className="mt-4 text-sm text-black/50">Изменений пока нет.</p>}</section>
    </>
  );
}
