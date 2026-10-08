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
                  className="flex min-h-[30rem] flex-col bg-[color:var(--accent)] p-6 text-[color:var(--foreground)]"
                  exit={{ opacity: 0, rotateY: prefersReducedMotion ? 0 : 90 }}
                  id={panelId}
                  initial={{ opacity: 0, rotateY: prefersReducedMotion ? 0 : -90 }}
                  key="back"
                  transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" }}
                >
                  <button
                    aria-controls={panelId}
                    aria-expanded="true"
                    aria-label={`Вернуться: ${service.name}`}
                    className="ml-auto grid size-11 place-items-center border border-black/35 text-2xl font-light transition-colors hover:bg-black hover:text-white focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-black"
                    onClick={() => setOpenCard(null)}
                    type="button"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                  <p className="mt-8 text-xs font-black uppercase tracking-[0.16em]">Стоимость работы</p>
                  <p className="mt-3 text-3xl font-black uppercase tracking-[-0.05em]">от {service.price} ₽/час</p>
                  <h2 className="mt-8 text-2xl font-black uppercase tracking-[-0.04em]">{service.name}</h2>
                  <p className="mt-4 text-base leading-relaxed">{service.description}</p>
                  <a className="mt-auto inline-flex min-h-11 items-center justify-center bg-black px-5 text-sm font-black uppercase tracking-[0.08em] text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-black" href="#personnel-contact">
                    Оставить заявку
                  </a>
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
