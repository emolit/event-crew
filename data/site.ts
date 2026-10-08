export interface NavItem {
  label: string;
  href: string;
}

export interface ContactItem {
  label: string;
  value: string;
  href: string;
  icon: "phone" | "telegram" | "whatsapp" | "email";
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
  heroImage: "/images/hero-backstage.jpg",
  logo: "/images/brand/event-crew-logo.png",
  nav: [
    { label: "Персонал", href: "/personnel" },
    { label: "Почему мы", href: "/#advantages" },
    { label: "Проекты", href: "/#projects" },
    { label: "Как мы работаем", href: "/#process" },
    { label: "Контакты", href: "/#contacts" },
  ],
  contacts: {
    phone: { label: "Телефон", value: "+7 985 197-56-63", href: "tel:+79851975663", icon: "phone" },
    telegram: { label: "Telegram", value: "@EVENT_CREW", href: "https://t.me/EVENT_CREW", icon: "telegram" },
    whatsapp: { label: "WhatsApp", value: "+7 985 197-56-63", href: "https://wa.me/79851975663", icon: "whatsapp" },
    email: { label: "Email", value: "eventcrew@bk.ru", href: "mailto:eventcrew@bk.ru", icon: "email" },
  },
} as const satisfies SiteConfig;

