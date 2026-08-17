export interface NavItem {
  label: string;
  href: `#${string}`;
}

export interface ContactItem {
  label: string;
  value: string;
  href: string;
}

export interface SiteConfig {
  brand: string;
  tagline: string;
  heroImage: string;
  logo: string;
  nav: readonly NavItem[];
  contacts: {
    phone: ContactItem;
    telegram: ContactItem;
    whatsapp: ContactItem;
    email: ContactItem;
  };
}

export const siteConfig = {
  brand: "EVENT CREW",
  tagline: "STAFF FOR EVENTS",
  heroImage: "/images/hero-event.webp",
  logo: "/images/brand/event-crew-logo.png",
  nav: [
    { label: "Услуги", href: "#services" },
    { label: "Контроль", href: "#advantages" },
    { label: "Проекты", href: "#projects" },
    { label: "Процесс", href: "#process" },
    { label: "Контакты", href: "#contacts" },
  ],
  contacts: {
    // Demonstrational, not verified business contact.
    phone: { label: "Телефон", value: "+7 (000) 000-00-00", href: "tel:+70000000000" },
    // Demonstrational, not verified business contact.
    telegram: { label: "Telegram", value: "@eventcrew", href: "https://t.me/eventcrew" },
    // Demonstrational, not verified business contact.
    whatsapp: { label: "WhatsApp", value: "+7 (000) 000-00-00", href: "https://wa.me/70000000000" },
    // Demonstrational, not verified business contact.
    email: { label: "Email", value: "hello@eventcrew.ru", href: "mailto:hello@eventcrew.ru" },
  },
} as const satisfies SiteConfig;

