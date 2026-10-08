import Image from "next/image";
import { siteConfig } from "@/data/site";

function ContactIcon({ type }: { type: "phone" | "telegram" | "whatsapp" | "email" }) {
  const commonProps = {
    "aria-hidden": true,
    className: "size-6",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  };

  if (type === "phone") {
    return (
      <svg {...commonProps}>
        <path d="M7.2 3.5 4.8 5.9c-.7.7-.8 1.8-.3 2.7a25.7 25.7 0 0 0 10.9 10.9c.9.5 2 .4 2.7-.3l2.4-2.4-4-3-2.1 2.1a17.4 17.4 0 0 1-6.3-6.3l2.1-2.1-3-4Z" />
      </svg>
    );
  }

  if (type === "telegram") {
    return (
      <svg {...commonProps}>
        <path d="m21 4-3 16-6.1-4.5L9 18l.7-5.2L18 6.5 7.7 11.7 3 10.2 21 4Z" />
      </svg>
    );
  }

  if (type === "whatsapp") {
    return (
      <svg {...commonProps}>
        <path d="M20 11.6a8 8 0 0 1-11.8 7l-4.2 1.2 1.2-4A8 8 0 1 1 20 11.6Z" />
        <path d="M9 8.3c.5 2.6 2.1 4.2 4.7 4.7l1.2-1.2 2.1 1c-.4 1.7-1.5 2.5-3.1 2.3-3.8-.5-6.5-3.2-7-7-.2-1.6.6-2.7 2.3-3.1l1 2.1L9 8.3Z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <rect height="14" rx="1.5" width="18" x="3" y="5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="scroll-mt-24 border-t border-black/10 bg-[color:var(--foreground)] text-[color:var(--background)]" id="contacts">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1.5fr)] lg:px-12">
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
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-white/55">Свяжитесь с нами</p>
          <address className="grid gap-3 not-italic sm:grid-cols-2">
            {Object.values(siteConfig.contacts).map((contact) => {
              const isMessenger = contact.label === "Telegram" || contact.label === "WhatsApp";

              return (
                <a
                  className="group flex min-h-24 items-center gap-4 rounded-sm border border-white/15 bg-white/[0.04] px-4 py-4 transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:bg-white/[0.08] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]"
                  href={contact.href}
                  key={contact.label}
                  rel={isMessenger ? "noopener noreferrer" : undefined}
                  target={isMessenger ? "_blank" : undefined}
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[color:var(--accent)]/45 bg-[color:var(--accent)]/10 text-[color:var(--accent)] transition-colors group-hover:bg-[color:var(--accent)] group-hover:text-[color:var(--foreground)]">
                    <ContactIcon type={contact.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-black uppercase tracking-[0.12em] text-[color:var(--accent)]">{contact.label}</span>
                    <span className="mt-1 block break-words text-base font-bold leading-snug transition-colors group-hover:text-white">{contact.value}</span>
                  </span>
                </a>
              );
            })}
          </address>
        </div>
      </div>
      <div className="border-t border-white/15 px-5 py-5 text-center text-xs font-bold uppercase tracking-[0.1em] text-white/65 sm:px-8 lg:px-12">© 2026 EVENT CREW. Все права защищены.</div>
    </footer>
  );
}
