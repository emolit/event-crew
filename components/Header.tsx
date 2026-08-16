"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/data/site";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = (returnFocus = false) => {
    setIsMenuOpen(false);
    if (returnFocus) {
      requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu(true);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-[color:var(--background)]/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <a className="inline-flex min-h-11 min-w-11 items-center rounded-sm focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]" href="#top" aria-label="EVENT CREW — на главную">
          <Image src={siteConfig.logo} alt="Логотип EVENT CREW" width={48} height={48} priority />
        </a>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Основная навигация">
          {siteConfig.nav.map((item) => (
            <a className="rounded-sm py-3 text-sm font-bold uppercase tracking-[0.08em] transition-colors hover:text-[color:var(--muted)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="hidden min-h-11 items-center rounded-sm bg-[color:var(--accent)] px-5 text-sm font-black uppercase tracking-[0.08em] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--foreground)] lg:inline-flex" href="#contact">
          Оставить заявку
        </a>

        <button
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
          className="grid size-11 place-items-center rounded-sm border border-black/15 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)] lg:hidden"
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

      {isMenuOpen && (
        <div aria-label="Мобильная навигация" aria-modal="true" className="fixed inset-x-0 top-20 border-b border-black/10 bg-[color:var(--background)] px-5 py-6 shadow-xl lg:hidden" id="mobile-navigation" role="dialog">
          <nav aria-label="Мобильная навигация">
            <ul className="mx-auto grid max-w-7xl gap-1">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <a className="flex min-h-11 items-center rounded-sm px-3 text-lg font-black uppercase tracking-[0.04em] hover:bg-black/5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]" href={item.href} onClick={() => closeMenu()}>
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="pt-3">
                <a className="flex min-h-11 items-center justify-center rounded-sm bg-[color:var(--accent)] px-5 text-sm font-black uppercase tracking-[0.08em] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--foreground)]" href="#contact" onClick={() => closeMenu()}>
                  Оставить заявку
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
