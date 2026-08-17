import Image from "next/image";
import { services } from "@/data/services";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Services() {
  return (
    <section aria-labelledby="services-heading" className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-24 sm:py-32" id="services">
      <Reveal>
        <div id="services-heading">
          <SectionHeading eyebrow="Состав команды" title="Кого выводим на площадку" description="Соберём одну роль или смешанную команду. Для каждой смены фиксируем задачи и время работы." />
        </div>
      </Reveal>
      <ul aria-label="Состав команды" className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-12">
        {services.map((service, index) => (
          <li className={index % 4 === 0 || index % 4 === 3 ? "lg:col-span-7" : "lg:col-span-5"} key={service.id}>
            <Reveal delay={Math.min(index * 0.04, 0.2)}>
              <article className="group grid h-full border-t border-black/20 pt-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(11rem,0.95fr)] lg:gap-5">
              <div className="aspect-[2/3] overflow-hidden bg-black/5">
                <Image alt={service.alt} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.015]" height={1200} sizes="(min-width: 1024px) 38vw, (min-width: 640px) 50vw, 100vw" src={service.image} width={800} />
              </div>
              <div className="flex flex-col py-4 lg:py-1">
                <span className="text-xs font-bold tabular-nums tracking-[0.14em] text-[color:var(--muted)]">ROLE / {String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 text-3xl font-black leading-none tracking-[-0.035em]">{service.name}</h3>
                <p className="mt-auto pt-5 leading-relaxed text-[color:var(--muted)]">{service.description}</p>
              </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
