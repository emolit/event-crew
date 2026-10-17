"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
  imageSizes: string;
  autoSlideOffset?: number;
}

const imageVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -24 }),
};

export default function ProjectCard({ project, imageSizes, autoSlideOffset = 0 }: ProjectCardProps) {
  const images = project.images ?? [project.image];
  const [activeImage, setActiveImage] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hasDetails = Boolean(project.detailTitle && project.description);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (images.length < 2 || isDetailsOpen) return;

    let interval: number | undefined;
    const advanceImage = () => {
      setSlideDirection(1);
      setActiveImage((current) => (current + 1) % images.length);
    };

    const timeout = window.setTimeout(() => {
      advanceImage();
      interval = window.setInterval(advanceImage, 5000);
    }, 5000 + autoSlideOffset);

    return () => {
      window.clearTimeout(timeout);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [autoSlideOffset, images.length, isDetailsOpen]);

  useEffect(() => {
    if (!isDetailsOpen) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsDetailsOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      trigger?.focus();
    };
  }, [isDetailsOpen]);

  const showPrevious = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSlideDirection(-1);
    setActiveImage((current) => (current - 1 + images.length) % images.length);
  };

  const showNext = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSlideDirection(1);
    setActiveImage((current) => (current + 1) % images.length);
  };

  const releaseMouseFocus = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
  };

  const toggleDetails = () => {
    if (hasDetails) setIsDetailsOpen((current) => !current);
  };

  const closeDetails = () => setIsDetailsOpen(false);

  return (
    <>
      <article aria-label={project.title} className="group relative h-full overflow-hidden bg-black text-white">
        <AnimatePresence custom={slideDirection} initial={false}>
          <motion.div
            animate="center"
            className="absolute inset-0"
            custom={slideDirection}
            exit={prefersReducedMotion ? "center" : "exit"}
            initial={prefersReducedMotion ? "center" : "enter"}
            key={images[activeImage]}
            transition={{ duration: prefersReducedMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
            variants={imageVariants}
          >
            <Image
              alt={project.alt}
              className="object-cover opacity-85 transition-transform duration-700 group-hover:scale-[1.025]"
              fill
              sizes={imageSizes}
              src={images[activeImage]}
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-3 inset-y-0 z-30 flex items-center justify-between opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
            <button
              aria-label={`Предыдущая фотография проекта ${project.title}`}
              className="pointer-events-auto grid size-12 place-items-center text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] transition duration-300 hover:-translate-x-0.5 hover:scale-110 hover:text-white focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              onClick={showPrevious}
              onMouseUp={releaseMouseFocus}
              type="button"
            >
              <svg aria-hidden="true" className="size-9" fill="none" viewBox="0 0 24 24">
                <path d="m15 18-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.65" />
              </svg>
            </button>
            <button
              aria-label={`Следующая фотография проекта ${project.title}`}
              className="pointer-events-auto grid size-12 place-items-center text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] transition duration-300 hover:translate-x-0.5 hover:scale-110 hover:text-white focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              onClick={showNext}
              onMouseUp={releaseMouseFocus}
              type="button"
            >
              <svg aria-hidden="true" className="size-9" fill="none" viewBox="0 0 24 24">
                <path d="m9 6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.65" />
              </svg>
            </button>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5 pt-20 sm:p-6">
          <h3 className="text-2xl font-black uppercase tracking-[-0.05em]">{project.title}</h3>
          <p className="mt-3 flex flex-wrap gap-x-2 text-sm leading-relaxed text-white/70">
            {project.roles.map((role, roleIndex) => (
              <span key={role}>
                {roleIndex > 0 && <span aria-hidden="true"> · </span>}
                {role}
              </span>
            ))}
          </p>
          {images.length > 1 && (
            <div aria-hidden="true" className="mt-4 flex gap-1.5">
              {images.map((image, index) => (
                <span className={`h-0.5 transition-all ${index === activeImage ? "w-7 bg-white" : "w-3 bg-white/35"}`} key={image} />
              ))}
            </div>
          )}
        </div>
        {hasDetails && (
          <button
            aria-expanded={isDetailsOpen}
            aria-haspopup="dialog"
            aria-label={`Открыть описание проекта ${project.title}`}
            className="absolute inset-0 z-20 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white"
            onClick={toggleDetails}
            ref={triggerRef}
            type="button"
          />
        )}
      </article>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isDetailsOpen && hasDetails && (
              <motion.div
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[100] grid place-items-center px-4 py-6 sm:px-6"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
              >
                <button
                  aria-label={`Закрыть описание проекта ${project.title}`}
                  className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
                  onClick={closeDetails}
                  type="button"
                />
                <motion.div
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="relative z-10 grid w-full place-items-center"
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 12 }}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 18 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <section
                    aria-labelledby={`${project.id}-details-title`}
                    aria-modal="true"
                    className="flex w-full flex-col overflow-hidden border border-white/15 bg-[color:var(--foreground)] text-white shadow-[0_24px_90px_rgba(0,0,0,0.48)]"
                    data-theme="dark"
                    role="dialog"
                    style={{ maxHeight: "78vh", maxWidth: "44rem" }}
                  >
                    <div className="overflow-y-auto p-6 sm:p-8 lg:p-10">
                      <div className="h-px w-12 bg-white/45" aria-hidden="true" />
                      <h3
                        className="mt-7 max-w-2xl text-2xl font-black uppercase leading-[1.02] tracking-[-0.045em] sm:text-3xl"
                        id={`${project.id}-details-title`}
                      >
                        {project.detailTitle}
                      </h3>
                      <p className="mt-5 max-w-2xl whitespace-pre-line text-sm leading-[1.75] text-white/70 sm:text-base">
                        {project.description}
                      </p>
                      <p className="mt-6 text-xs font-black uppercase tracking-[0.11em] sm:text-sm">{project.roles.join(" • ")}</p>
                      <button
                        aria-label="Вернуться к проектам"
                        className="mt-8 inline-flex min-h-11 items-center justify-center bg-white px-5 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--foreground)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        onClick={closeDetails}
                        ref={closeButtonRef}
                        type="button"
                      >
                        Вернуться к проектам
                      </button>
                    </div>
                  </section>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
