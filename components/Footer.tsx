import Image from "next/image";
import { siteConfig } from "@/data/site";

function ContactIcon({ type }: { type: "phone" | "telegram" | "whatsapp" | "email" }) {
  const commonProps = {
    "aria-hidden": true,
    className: "size-5",
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
      <div className="mx-auto grid max-w-[94rem] items-start gap-x-8 gap-y-10 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:px-12 xl:grid-cols-[minmax(13rem,1fr)_minmax(8rem,0.55fr)_minmax(25rem,1.65fr)_minmax(17rem,1.05fr)] xl:gap-x-9">
        <div className="order-1 min-w-0">
          <div className="flex items-start gap-4">
            <Image alt="Логотип EVENT CREW" height={64} src={siteConfig.logo} width={64} />
            <div>
              <p className="text-xl font-black tracking-[-0.05em] sm:text-2xl">{siteConfig.brand}</p>
              <p className="mt-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--accent)] sm:text-sm">{siteConfig.tagline}</p>
            </div>
          </div>

          <section aria-labelledby="footer-clients-heading" className="mt-7">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-white/50" id="footer-clients-heading">
              Наши постоянные клиенты
            </p>
            <a
              aria-label="TRACE Advertising Group"
              className="mt-3 flex h-16 max-w-52 items-center border border-white/15 bg-white/[0.035] px-4 transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:bg-white/[0.07] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]"
              href="https://trace-group.ru/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Image
                alt="TRACE Advertising Group"
                className="h-auto w-full max-w-44 object-contain"
                height={804}
                sizes="176px"
                src="/images/clients/trace-group.png"
                width={1956}
              />
            </a>
          </section>
        </div>

        <nav aria-label="Навигация в подвале" className="order-4 lg:order-2">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 lg:grid lg:gap-0">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <a className="inline-flex min-h-10 items-center rounded-sm text-xs font-bold uppercase tracking-[0.08em] transition-colors hover:text-[color:var(--accent)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)] sm:text-sm" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="footer-contacts-heading" className="order-2 min-w-0 lg:order-3">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-white/55" id="footer-contacts-heading">Свяжитесь с нами</p>
          <address className="grid gap-2.5 not-italic sm:grid-cols-2">
            {Object.values(siteConfig.contacts).map((contact) => {
              const isMessenger = contact.label === "Telegram" || contact.label === "WhatsApp";

              return (
                <a
                  className="group flex min-h-20 items-center gap-3 rounded-sm border border-white/15 bg-white/[0.04] px-3 py-3 transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:bg-white/[0.08] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)]"
                  href={contact.href}
                  key={contact.label}
                  rel={isMessenger ? "noopener noreferrer" : undefined}
                  target={isMessenger ? "_blank" : undefined}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[color:var(--accent)]/45 bg-[color:var(--accent)]/10 text-[color:var(--accent)] transition-colors group-hover:bg-[color:var(--accent)] group-hover:text-[color:var(--foreground)]">
                    <ContactIcon type={contact.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.68rem] font-black uppercase tracking-[0.12em] text-[color:var(--accent)]">{contact.label}</span>
                    <span className="mt-1 block break-words text-sm font-bold leading-snug transition-colors group-hover:text-white">{contact.value}</span>
                  </span>
                </a>
              );
            })}
          </address>
        </section>

        <aside
          aria-label="Акция для новых клиентов"
          className="relative order-3 w-full max-w-sm rotate-[0.8deg] bg-[color:var(--accent)] px-5 py-5 text-[color:var(--foreground)] shadow-[7px_7px_0_rgba(255,255,255,0.11)] lg:order-4 lg:rotate-[1.25deg] xl:max-w-[19rem] xl:justify-self-end"
          style={{ clipPath: "polygon(0 0, 92% 0, 100% 16%, 100% 84%, 92% 100%, 0 100%)" }}
        >
          <span aria-hidden="true" className="absolute right-4 top-4 size-1.5 rounded-full bg-[color:var(--foreground)]" />
          <p className="max-w-[14rem] text-xl font-black uppercase leading-[0.92] tracking-[-0.045em]">
            Супервайзер в подарок!
          </p>
          <p className="mt-2.5 max-w-[15rem] text-xs font-bold leading-relaxed">
            Закажите персонал от 4 человек и получите супервайзера бесплатно
          </p>
          <p className="mt-3 text-[0.6rem] font-black uppercase tracking-[0.13em] opacity-70">
            Акция для новых клиентов*
          </p>
        </aside>
      </div>
      <div className="border-t border-white/15 px-5 py-4 text-center text-[0.68rem] font-bold uppercase tracking-[0.1em] text-white/65 sm:px-8 lg:px-12">© 2026 EVENT CREW. Все права защищены.</div>
    </footer>
  );
}
