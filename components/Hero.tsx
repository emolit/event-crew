import Image from "next/image";
import { siteConfig } from "@/data/site";

export default function Hero() {
  return (
    <section className="mx-auto grid min-h-[90svh] max-w-7xl items-center gap-6 px-5 pb-12 pt-28 sm:min-h-[95svh] sm:gap-8 sm:px-8 sm:pb-16 lg:min-h-[100svh] lg:grid-cols-[minmax(0,0.94fr)_minmax(20rem,0.86fr)] lg:gap-10 lg:px-12 lg:pb-20">
      <div className="relative z-10 min-w-0">
        <p className="mb-5 text-sm font-black uppercase tracking-[0.16em] text-[color:var(--muted)]">{siteConfig.tagline}</p>
        <h1 className="max-w-3xl text-[clamp(2.1rem,10.5vw,3rem)] font-black uppercase leading-[0.84] tracking-[-0.07em] sm:text-[clamp(3rem,8vw,7.5rem)] lg:text-[clamp(3.9rem,5.55vw,5.1rem)]">Люди, на которых держится событие</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[color:var(--muted)] sm:text-xl">Подберём и выведем на площадку хостес, координаторов, регистраторов и линейный персонал в Москве</p>
        <a className="mt-7 inline-flex min-h-11 items-center rounded-sm bg-[color:var(--accent)] px-6 text-sm font-black uppercase tracking-[0.08em] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--foreground)]" href="#contact">
          Рассчитать команду
        </a>
      </div>
      <div className="relative min-h-64 min-w-0 overflow-hidden bg-black sm:min-h-[22rem] lg:min-h-[32rem]" style={{ clipPath: "polygon(0 7%, 91% 0, 100% 88%, 12% 100%)" }}>
        <Image alt="Команда EVENT CREW на мероприятии" className="object-cover" fill priority sizes="(min-width: 1024px) 45vw, 100vw" src={siteConfig.heroImage} />
        <p className="absolute bottom-4 left-4 right-4 bg-black/80 p-3 text-xs font-bold uppercase tracking-[0.08em] text-white">Москва / состав от 2 человек / на связи в день события</p>
      </div>
    </section>
  );
}
