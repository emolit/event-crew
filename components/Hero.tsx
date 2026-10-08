import Image from "next/image";
import { siteConfig } from "@/data/site";

const metrics = [
  { value: "100+", label: "мероприятий" },
  { value: "400+", label: "база сотрудников" },
  { value: "15 мин", label: "первичный расчёт" },
] as const;

export default function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        alt="Подготовка площадки EVENT CREW"
        className="-z-20 object-cover object-[50%_55%]"
        fill
        priority
        sizes="100vw"
        src={siteConfig.heroImage}
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,0,0,0.86)_0%,rgba(0,0,0,0.66)_48%,rgba(0,0,0,0.34)_100%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

      <div className="mx-auto flex min-h-[100svh] max-w-7xl flex-col px-5 pb-5 pt-28 sm:px-8 sm:pb-7 lg:px-12 lg:pt-32">
        <div className="flex flex-1 items-center py-5 sm:py-8">
          <div className="max-w-4xl">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-white/70 sm:text-sm">{siteConfig.tagline}</p>
            <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-black uppercase leading-[0.86] tracking-[-0.065em]">Персонал для вашего мероприятия</h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-white/85 sm:text-xl">Хелперы, хостес, промоутеры, официанты и другой персонал.</p>
            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
              <a className="inline-flex min-h-11 items-center rounded-sm bg-[color:var(--accent)] px-5 text-xs font-black uppercase tracking-[0.08em] text-[color:var(--foreground)] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-6 sm:text-sm" href="#contact">
                Рассчитать стоимость
              </a>
              <a className="inline-flex min-h-11 items-center rounded-sm border border-white/75 bg-black/20 px-5 text-xs font-black uppercase tracking-[0.08em] text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-6 sm:text-sm" href="/personnel">
                Посмотреть услуги
              </a>
            </div>
          </div>
        </div>

        <ul aria-label="EVENT CREW в цифрах" className="grid grid-cols-3 border-y border-white/25 bg-black/25 backdrop-blur-sm">
          {metrics.map((metric, index) => (
            <li className={`min-w-0 px-2 py-3 sm:px-6 sm:py-5 lg:px-8 ${index > 0 ? "border-l border-white/25" : ""}`} key={metric.label}>
              <p className="whitespace-nowrap text-[clamp(1.4rem,4.4vw,3.25rem)] font-black leading-none tracking-[-0.05em]">{metric.value}</p>
              <p className="mt-1 text-[0.6rem] font-bold uppercase leading-tight tracking-[0.06em] text-white/75 sm:mt-2 sm:text-xs">{metric.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
