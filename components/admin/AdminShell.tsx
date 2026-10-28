import type { ReactNode } from "react";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import type { AuthUser } from "@/lib/auth/session";

export default function AdminShell({ children, user }: { children: ReactNode; user: AuthUser }) {
  return (
    <div className="min-h-screen bg-[#121210] text-white">
      <header className="flex min-h-[73px] items-center justify-between border-b border-white/10 bg-[#151513] px-5 lg:px-7">
        <Link className="text-xl font-black tracking-[-0.04em]" href="/admin">EVENT <span className="text-[color:var(--accent)]">CREW</span> <span className="text-white/35">/ ADMIN</span></Link>
        <div className="mr-14 flex items-center gap-3 lg:mr-0">
          <Link className="hidden text-xs font-black uppercase tracking-[0.08em] text-white/55 hover:text-[color:var(--accent)] sm:block" href="/" target="_blank">Открыть сайт</Link>
          <span className="grid size-9 place-items-center rounded-full bg-[color:var(--accent)] font-black text-black">{user.username.slice(0, 1).toUpperCase()}</span>
          <form action="/admin/logout" method="post"><button className="text-xs font-bold text-white/55 hover:text-white" type="submit">Выйти</button></form>
        </div>
      </header>
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        <AdminNav />
        <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
