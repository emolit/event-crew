"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/data/site";

const focusableSelector = 'a[href], button:not([disabled])';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocusRef = useRef(false);

  const closeMenu = (returnFocus = false) => {
    setIsMenuOpen(false);
    shouldRestoreFocusRef.current = returnFocus;
  };

  useEffect(() => {
    if (!isMenuOpen) {
      if (shouldRestoreFocusRef.current) {
        menuButtonRef.current?.focus();
        shouldRestoreFocusRef.current = false;
      }
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const backgroundElements = Array.from(
      document.querySelectorAll<HTMLElement>("main, footer"),
    );
    const previousInertStates = backgroundElements.map((element) => ({
      element,
      wasInert: element.hasAttribute("inert"),
    }));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu(true);
    };

    document.body.style.overflow = "hidden";
    backgroundElements.forEach((element) => element.setAttribute("inert", ""));
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousInertStates.forEach(({ element, wasInert }) => {
        if (!wasInert) {
          element.removeAttribute("inert");
        }
      });
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  const trapFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;

    const focusableElements = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    }
    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-[color:var(--background)]/90 text-[color:var(--foreground)] backdrop-blur-md">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <Link className="inline-flex min-h-11 min-w-11 items-center rounded-sm focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]" href="/" aria-label="EVENT CREW — на главную">
            <Image src={siteConfig.logo} alt="Логотип EVENT CREW" width={48} height={48} priority />
          </Link>

          <nav className="hidden items-center gap-6 xl:flex" aria-label="Основная навигация">
            {siteConfig.nav.map((item) => (
              <Link className="rounded-sm py-3 text-sm font-bold uppercase tracking-[0.08em] transition-colors hover:text-[color:var(--muted)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <Link className="hidden min-h-11 items-center rounded-sm bg-[color:var(--accent)] px-5 text-sm font-black uppercase tracking-[0.08em] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--foreground)] xl:inline-flex" href="#contacts">
            Оставить заявку
          </Link>

          <button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
            className="grid size-11 place-items-center rounded-sm border border-black/15 bg-[color:var(--foreground)] text-white focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)] xl:hidden"
            onClick={() => (isMenuOpen ? closeMenu(true) : setIsMenuOpen(true))}
            ref={menuButtonRef}
            type="button"
          >
            <span aria-hidden="true" className="grid gap-1.5">
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            aria-label="Мобильная навигация"
            aria-modal="true"
            className="fixed inset-0 z-[60] overflow-y-auto bg-[color:var(--background)] xl:hidden"
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -16 }}
            id="mobile-navigation"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -16 }}
            onKeyDown={trapFocus}
            ref={dialogRef}
            role="dialog"
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
          >
            <div className="mx-auto flex min-h-full max-w-7xl flex-col px-5 py-5 sm:px-8">
              <button className="ml-auto inline-flex min-h-11 items-center justify-center rounded-sm border border-black/15 px-4 text-sm font-black uppercase tracking-[0.08em] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]" onClick={() => closeMenu(true)} type="button">
                Закрыть меню
              </button>
              <nav aria-label="Мобильная навигация" className="flex flex-1 items-center py-6">
                <ul className="grid w-full gap-1">
                  {siteConfig.nav.map((item) => (
                    <li key={item.href}>
                      <Link className="flex min-h-11 items-center rounded-sm px-3 text-lg font-black uppercase tracking-[0.04em] hover:bg-black/5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]" href={item.href} onClick={() => closeMenu(true)}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li className="pt-3">
                    <Link className="flex min-h-11 items-center justify-center rounded-sm bg-[color:var(--accent)] px-5 text-sm font-black uppercase tracking-[0.08em] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--foreground)]" href="#contacts" onClick={() => closeMenu(true)}>
                      Оставить заявку
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
