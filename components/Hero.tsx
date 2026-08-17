import Image from "next/image";
import { siteConfig } from "@/data/site";

export default function Hero() {
  return (
    <section className="relative mx-auto grid min-h-[100svh] max-w-[var(--content-width)] items-end gap-8 overflow-hidden px-[var(--page-gutter)] pb-8 pt-28 lg:grid-cols-12 lg:gap-6 lg:pb-14">
      <div className="relative z-10 min-w-0 pb-2 lg:col-span-7 lg:pb-12">
        <p className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--muted)]">{siteConfig.tagline} / MOSCOW</p>
        <div className="crew-line pl-5 sm:pl-7" data-crew-line="hero">
          <h1 className="max-w-4xl text-[clamp(3.25rem,11vw,7.9rem)] font-black leading-[0.82] tracking-[-0.055em]">Люди, на которых держится событие</h1>
        </div>
        <div className="mt-8 grid gap-6 border-t border-black/15 pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <p className="max-w-xl text-base leading-relaxed text-[color:var(--muted)] sm:text-lg">Подберём и выведем на площадку хостес, координаторов, регистраторов и линейный персонал в Москве</p>
          <a className="inline-flex min-h-12 items-center justify-center rounded-sm bg-[color:var(--accent)] px-6 text-sm font-extrabold uppercase tracking-[0.08em] transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.97]" href="#contact">
            Рассчитать команду
          </a>
        </div>
      </div>
      <div className="relative min-h-[22rem] min-w-0 overflow-hidden bg-black sm:min-h-[32rem] lg:col-span-5 lg:min-h-[72svh]">
        <Image alt="Команда EVENT CREW на мероприятии" className="object-cover" fill priority sizes="(min-width: 1024px) 42vw, 100vw" src={siteConfig.heroImage} />
        <p className="absolute bottom-0 left-0 right-0 border-t border-white/20 bg-black/75 p-4 text-xs font-bold uppercase leading-relaxed tracking-[0.08em] text-white">Москва / состав от 2 человек / на связи в день события</p>
      </div>
    </section>
  );
}
