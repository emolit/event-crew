import Image from "next/image";
import { siteConfig } from "@/data/site";

export default function Footer() {
  return (
    <footer className="scroll-mt-24 border-t border-black/10 bg-[color:var(--foreground)] text-[color:var(--background)]" id="contacts">
      <div className="mx-auto grid max-w-[var(--content-width)] gap-10 px-[var(--page-gutter)] py-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,1.5fr)]">
        <div className="flex items-start gap-4">
          <Image alt="Логотип EVENT CREW" height={72} src={siteConfig.logo} width={72} />
          <div>
            <p className="text-2xl font-black tracking-[-0.05em]">{siteConfig.brand}</p>
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.12em] text-[color:var(--accent)]">{siteConfig.tagline}</p>
          </div>
        </div>
        <nav aria-label="Навигация в подвале">
          <ul className="grid gap-1">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <a className="inline-flex min-h-11 items-center rounded-sm text-sm font-bold uppercase tracking-[0.08em] transition-colors hover:text-[color:var(--accent)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <address className="grid gap-4 not-italic sm:grid-cols-2">
          {Object.values(siteConfig.contacts).map((contact) => {
            const isMessenger = contact.label === "Telegram" || contact.label === "WhatsApp";

            return (
              <a className="group min-h-11 rounded-sm py-1 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]" href={contact.href} key={contact.label} rel={isMessenger ? "noopener noreferrer" : undefined} target={isMessenger ? "_blank" : undefined}>
                <span className="block text-xs font-black uppercase tracking-[0.12em] text-[color:var(--accent)]">{contact.label}</span>
                <span className="mt-1 block text-base font-bold transition-colors group-hover:text-[color:var(--accent)]">{contact.value}</span>
              </a>
            );
          })}
        </address>
      </div>
      <div className="border-t border-white/15 px-5 py-5 text-center text-xs font-bold uppercase tracking-[0.1em] text-white/65 sm:px-8 lg:px-12">© 2026 EVENT CREW. Все права защищены.</div>
    </footer>
  );
}
