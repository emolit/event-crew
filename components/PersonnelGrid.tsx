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
          <li aria-label={service.name} className="min-h-[30rem] [perspective:1200px]" key={service.id}>
            <AnimatePresence initial={false} mode="wait">
              {isOpen ? (
                <motion.article
                  animate={{ opacity: 1, rotateY: 0 }}
                  className="relative min-h-[30rem] overflow-hidden bg-[color:var(--accent)] text-[color:var(--foreground)]"
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
                  <div className="pointer-events-none relative z-10 flex min-h-[30rem] flex-col p-6">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-black/55">Нажмите ещё раз, чтобы вернуться</p>
                    <p className="mt-10 text-xs font-black uppercase tracking-[0.16em]">Стоимость работы</p>
                    <p className="mt-3 font-serif text-4xl font-bold leading-none tracking-[-0.03em]">от {service.price} ₽/час</p>
                    <h2 className="mt-8 text-2xl font-black uppercase tracking-[-0.04em]">{service.name}</h2>
                    <p className="mt-4 font-serif text-lg leading-7 text-black/75">{service.description}</p>
                    <a className="pointer-events-auto mt-auto inline-flex min-h-11 items-center justify-center bg-black px-5 text-sm font-black uppercase tracking-[0.08em] text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-black" href="#personnel-contact">
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
                  className="group relative block min-h-[30rem] w-full overflow-hidden bg-black text-left text-white focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]"
                  exit={{ opacity: 0, rotateY: prefersReducedMotion ? 0 : -90 }}
                  initial={{ opacity: 0, rotateY: prefersReducedMotion ? 0 : 90 }}
                  key="front"
                  onClick={() => setOpenCard(service.id)}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" }}
                  type="button"
                >
                  <Image alt={service.alt} className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" src={service.image} />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/5" />
                  <span className="absolute inset-x-0 bottom-0 grid min-h-28 grid-cols-[minmax(0,1fr)_2.75rem] items-end gap-3 p-5 sm:p-6" data-testid={`personnel-caption-${service.id}`}>
                    <span className="min-w-0 break-normal text-lg font-black uppercase leading-[0.95] tracking-[-0.04em]">{service.name}</span>
                    <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center border border-white/70 text-xl">↗</span>
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
