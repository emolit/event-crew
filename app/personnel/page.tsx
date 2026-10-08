import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PersonnelGrid from "@/components/PersonnelGrid";

export const metadata: Metadata = {
  title: "Персонал для мероприятий — EVENT CREW",
  description: "Хелперы, промоутеры, хостес, официанты и другой персонал для мероприятий в Москве.",
};

export default function PersonnelPage() {
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
            <PersonnelGrid />
          </div>
        </section>

        <ContactForm
          description="Опишите задачу — предложим подходящий состав команды и сделаем первичный расчёт. Пока заявки отправляются в Telegram."
          eyebrow="Особая задача"
          id="personnel-contact"
          title="Не нашли, что искали?"
        />
      </main>
      <Footer />
    </div>
  );
}
