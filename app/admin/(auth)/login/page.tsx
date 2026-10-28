import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "@/components/admin/LoginForm";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = { title: "Вход в админ-панель — EVENT CREW" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#11110f] px-5 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/15 bg-[#191917] p-7 shadow-2xl sm:p-9">
        <div className="flex items-center gap-4">
          <Image alt="EVENT CREW" height={56} src={siteConfig.logo} width={56} />
          <div><p className="text-xl font-black tracking-[-0.04em]">EVENT <span className="text-[color:var(--accent)]">CREW</span></p><p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">Administration</p></div>
        </div>
        <h1 className="mt-9 text-3xl font-black uppercase tracking-[-0.045em]">Вход в админ-панель</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">Управление содержимым сайта доступно только владельцу.</p>
        <LoginForm />
      </section>
    </main>
  );
}
