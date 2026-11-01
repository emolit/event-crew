import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PersonnelGrid from "@/components/PersonnelGrid";
import { getPublicContent } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Персонал для мероприятий — EVENT CREW",
  description: "Хелперы, промоутеры, хостес, официанты и другой персонал для мероприятий в Москве.",
};

export const dynamic = "force-dynamic";
export default async function PersonnelPage() {
  const content = await getPublicContent();
  return (
    <div className="bg-[color:var(--foreground)] text-white">
      <Header />
      <main>
        <section className="mx-auto max-w-7xl px-5 pb-20 pt-36 sm:px-8 sm:pb-28 lg:px-12 lg:pt-44">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[color:var(--accent)]">EVENT CREW</p>
          <div className="mt-4 grid gap-6 border-b border-white/20 pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <h1 className="text-[clamp(3.5rem,10vw,8rem)] font-black uppercase leading-[0.8] tracking-[-0.07em]">Персонал</h1>
            <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg lg:justify-self-end">
              Выберите специалиста и нажмите на карточку — внутри указаны задачи и стоимость работы.
            </p>
          </div>
          <div className="mt-10 lg:mt-14">
            <PersonnelGrid personnel={content.personnel} />
          </div>
        </section>
        <ContactForm />
      </main>
      <Footer clients={content.clients} content={content.footer} />
    </div>
  );
}
