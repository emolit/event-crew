"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { services } from "@/data/services";

export default function PersonnelGrid() {
  const [openCard, setOpenCard] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  return (
    <ul aria-label="Виды персонала" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {services.map((service) => {
        const isOpen = openCard === service.id;
        const panelId = `personnel-${service.id}`;

        return (
          <li aria-label={service.name} className="aspect-[4/5] min-h-0 [perspective:1200px]" key={service.id}>
            <AnimatePresence initial={false} mode="wait">
              {isOpen ? (
                <motion.article
                  animate={{ opacity: 1, rotateY: 0 }}
                  className="relative h-full min-h-0 overflow-hidden rounded-xl bg-[color:var(--accent)] text-[color:var(--foreground)]"
                  exit={{ opacity: 0, rotateY: prefersReducedMotion ? 0 : 90 }}
                  id={panelId}
                  initial={{ opacity: 0, rotateY: prefersReducedMotion ? 0 : -90 }}
                  key="back"
                  transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" }}
                >
                  <button
                    aria-controls={panelId}
                    aria-expanded="true"
                    aria-label={`Свернуть карточку: ${service.name}`}
                    className="absolute inset-0 z-0 size-full cursor-pointer focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-black"
                    onClick={() => setOpenCard(null)}
                    type="button"
                  />
                  <div className="pointer-events-none relative z-10 flex h-full min-h-0 flex-col p-5">
                    <p className="text-[0.58rem] font-black uppercase leading-4 tracking-[0.14em] text-black/55">Нажмите ещё раз, чтобы вернуться</p>
                    <p className="mt-4 text-xs font-black uppercase tracking-[0.16em]">Стоимость работы</p>
                    <p className="mt-2 font-serif text-3xl font-bold leading-none tracking-[-0.03em]">от {service.price} ₽/час</p>
                    <h2 className="mt-4 text-xl font-black uppercase leading-none tracking-[-0.04em]">{service.name}</h2>
                    <p className="mt-2 font-serif text-base leading-[1.35] text-black/75">{service.description}</p>
                    <a className="pointer-events-auto mt-auto inline-flex min-h-10 shrink-0 items-center justify-center bg-black px-4 text-xs font-black uppercase tracking-[0.08em] text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-black" href="#contacts">
                      Оставить заявку
                    </a>
                  </div>
                </motion.article>
              ) : (
                <motion.button
                  animate={{ opacity: 1, rotateY: 0 }}
                  aria-controls={panelId}
                  aria-expanded="false"
                  aria-label={`Подробнее: ${service.name}`}
                  className="group relative block h-full min-h-0 w-full overflow-hidden rounded-xl border border-black/10 bg-[#e8e6df] text-left text-black focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]"
                  exit={{ opacity: 0, rotateY: prefersReducedMotion ? 0 : -90 }}
                  initial={{ opacity: 0, rotateY: prefersReducedMotion ? 0 : 90 }}
                  key="front"
                  onClick={() => setOpenCard(service.id)}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" }}
                  type="button"
                >
                  <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.98),rgba(232,230,223,0.15)_48%,transparent_72%)]" />
                  <Image alt={service.alt} className="object-contain object-bottom px-1 pt-2 transition-transform duration-500 ease-out group-hover:scale-[1.025]" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" src={service.image} />
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[color:var(--accent)] via-[color:var(--accent)]/85 to-transparent" />
                  <span
                    className="absolute inset-x-0 bottom-0 grid min-h-28 items-end gap-3 p-5 sm:p-6"
                    data-testid={`personnel-caption-${service.id}`}
                    style={{ gridTemplateColumns: "minmax(0, 1fr) 1.5rem" }}
                  >
                    <span className="min-w-0 break-normal text-lg font-black uppercase leading-[0.95] tracking-[-0.04em]">{service.name}</span>
                    <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center self-end text-black transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" data-testid={`personnel-arrow-${service.id}`}>
                      <svg className="size-6" fill="none" focusable="false" viewBox="0 0 24 24">
                        <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                      </svg>
                    </span>
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
