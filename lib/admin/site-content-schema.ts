import { z } from "zod";

const text = (min = 1, max = 500) => z.string().trim().min(min).max(max);
const safeHref = z.string().trim().refine((value) => value.startsWith("/") || value.startsWith("#") || /^https?:\/\//i.test(value), "Недопустимая ссылка");
const contact = (scheme: "tel:" | "mailto:" | "https:") => z.object({
  label: text(1, 50), value: text(1, 150), icon: z.enum(["phone", "telegram", "whatsapp", "email"]),
  href: z.string().trim().refine((value) => scheme === "https:" ? /^https:\/\//i.test(value) : value.toLowerCase().startsWith(scheme), "Недопустимая ссылка контакта"),
});

export const homepageInputSchema = z.object({
  eyebrow: text(1, 100), title: text(2, 200), subtitle: text(2, 500),
  primaryButtonText: text(1, 80), primaryButtonHref: safeHref,
  secondaryButtonText: text(1, 80), secondaryButtonHref: safeHref,
  heroMediaId: z.string().min(1).max(80), heroImage: z.string().nullable().optional(),
});
export type HomepageInput = z.input<typeof homepageInputSchema>;

export const footerInputSchema = z.object({
  contacts: z.object({phone: contact("tel:"), telegram: contact("https:"), whatsapp: contact("https:"), email: contact("mailto:")}),
  promotion: z.object({title: text(2, 150), body: text(2, 500), disclaimer: text(1, 200), visible: z.boolean()}),
  copyrightText: text(2, 200),
});
export type FooterInput = z.input<typeof footerInputSchema>;

export const clientInputSchema = z.object({name:text(2,120),mediaId:z.string().min(1).max(80),alt:text(2,240),websiteUrl:z.string().url().refine(v=>/^https?:\/\//i.test(v),"Недопустимая ссылка"),visible:z.boolean()});
export type ClientInput = z.input<typeof clientInputSchema>;

