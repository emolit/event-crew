"use client";

import Image from "next/image";
import { useState } from "react";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { services, type Service } from "@/data/services";

export default function Services() {
  const [activeId, setActiveId] = useState<Service["id"]>(services[0].id);
  const activeService = services.find((service) => service.id === activeId) ?? services[0];

  return (
    <section aria-labelledby="services-heading" className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-24 sm:py-32" id="services">
      <Reveal>
        <div id="services-heading">
          <SectionHeading eyebrow="Состав команды" title="Кого выводим на площадку" description="Соберём одну роль или смешанную команду. Для каждой смены фиксируем задачи и время работы." />
        </div>
      </Reveal>

      <div className="mt-16 hidden grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)] gap-14 lg:grid">
        <figure className="sticky top-24 h-fit" data-active-service={activeService.id} data-testid="service-stage">
          <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
            <Image alt="" className="h-full w-full object-cover" height={1200} key={activeService.id} priority src={activeService.image} width={960} />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-black/80 px-5 py-4 text-[color:var(--background)]">
              <span className="text-xs font-extrabold uppercase tracking-[0.14em]">На площадке</span>
              <span className="text-sm font-bold">{activeService.name}</span>
            </figcaption>
          </div>
        </figure>

        <ul aria-label="Состав команды: выбор роли" className="border-b border-black/20">
          {services.map((service, index) => {
            const isActive = service.id === activeService.id;
            return (
              <li className="border-t border-black/20" key={service.id}>
                <button
                  aria-label={`Показать: ${service.name}`}
                  aria-pressed={isActive}
                  className="group grid w-full grid-cols-[3.25rem_minmax(0,1fr)] gap-4 py-5 text-left"
                  onClick={() => setActiveId(service.id)}
                  onFocus={() => setActiveId(service.id)}
                  onMouseEnter={() => setActiveId(service.id)}
                  type="button"
                >
                  <span className={`pt-1 text-xs font-black tabular-nums tracking-[0.12em] ${isActive ? "text-[color:var(--foreground)]" : "text-[color:var(--muted)]"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className={`block text-4xl font-black leading-none tracking-[-0.035em] transition-transform duration-150 ${isActive ? "translate-x-2" : "group-hover:translate-x-2"}`}>
                      {service.name}
                    </span>
                    <span className={`mt-3 block max-w-md text-sm leading-relaxed ${isActive ? "text-[color:var(--foreground)]" : "text-[color:var(--muted)]"}`}>
                      {service.description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <ul aria-label="Состав команды: карточки" className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:hidden">
        {services.map((service, index) => (
          <li key={service.id}>
            <Reveal delay={Math.min(index * 0.04, 0.2)}>
              <article className="group h-full border-t border-black/20 pt-3">
                <div className="aspect-[2/3] overflow-hidden bg-black/5">
                  <Image alt={service.alt} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.015]" height={1200} sizes="(min-width: 640px) 50vw, 100vw" src={service.image} width={800} />
                </div>
                <div className="py-4">
                  <span className="text-xs font-bold tabular-nums tracking-[0.14em] text-[color:var(--muted)]">ROLE / {String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-6 text-3xl font-black leading-none tracking-[-0.035em]">{service.name}</h3>
                  <p className="pt-5 leading-relaxed text-[color:var(--muted)]">{service.description}</p>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
