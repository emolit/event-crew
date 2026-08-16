import Image from "next/image";
import { siteConfig } from "@/data/site";

export default function Hero() {
  return (
    <section className="mx-auto grid min-h-[min(52rem,100svh)] max-w-7xl items-center gap-10 px-5 pb-16 pt-32 sm:px-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(20rem,0.86fr)] lg:px-12 lg:pb-24">
      <div className="relative z-10 min-w-0">
        <p className="mb-5 text-sm font-black uppercase tracking-[0.16em] text-[color:var(--muted)]">{siteConfig.tagline}</p>
        <h1 className="max-w-3xl text-[clamp(2.1rem,10.5vw,3rem)] font-black uppercase leading-[0.84] tracking-[-0.07em] sm:text-[clamp(3rem,8vw,7.5rem)] lg:text-[clamp(3.9rem,5.55vw,5.1rem)]">Персонал для вашего мероприятия</h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-[color:var(--muted)] sm:text-xl">Собираем сильные команды для событий, где важны энергия, точность и внимание к гостям.</p>
        <a className="mt-9 inline-flex min-h-11 items-center rounded-sm bg-[color:var(--accent)] px-6 text-sm font-black uppercase tracking-[0.08em] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--foreground)]" href="#contact">
          Оставить заявку
        </a>
      </div>
      <div className="relative min-h-80 min-w-0 overflow-hidden bg-black sm:min-h-[32rem]" style={{ clipPath: "polygon(0 7%, 91% 0, 100% 88%, 12% 100%)" }}>
        <Image alt="Команда EVENT CREW на мероприятии" className="object-cover" fill priority sizes="(min-width: 1024px) 45vw, 100vw" src={siteConfig.heroImage} />
      </div>
    </section>
  );
}
