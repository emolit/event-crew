import type { Metadata } from "next";
import { Manrope, Roboto_Condensed } from "next/font/google";
import { themeColors } from "@/lib/theme";
import "./globals.css";

const bodyFont = Manrope({ subsets: ["cyrillic", "latin"], variable: "--font-body", display: "swap" });
const displayFont = Roboto_Condensed({ subsets: ["cyrillic", "latin"], variable: "--font-display", display: "swap" });

const title = "Персонал для мероприятий в Москве | EVENT CREW";
const description = "Подберём и выведем на площадку хостес, координаторов, регистраторов и линейный персонал в Москве.";
const themeStyle = {
  "--background": themeColors.background,
  "--foreground": themeColors.foreground,
  "--accent": themeColors.accent,
  "--muted": themeColors.muted,
  "--muted-on-dark": themeColors.mutedOnDark,
  "--line": themeColors.line,
  "--danger": themeColors.danger,
} as React.CSSProperties;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title,
  description,
  icons: {
    icon: "/images/brand/event-crew-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: "EVENT CREW",
    title,
    description,
    images: [
      {
        url: "/images/og-event-crew.png",
        width: 1200,
        height: 630,
        alt: "EVENT CREW: команда для мероприятий в Москве",
      },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${bodyFont.variable} ${displayFont.variable}`} lang="ru" style={themeStyle}>
      <body>{children}</body>
    </html>
  );
}
