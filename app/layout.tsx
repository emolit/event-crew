import type { Metadata } from "next";
import { themeColors } from "@/lib/theme";
import "./globals.css";

const title = "Персонал для мероприятий в Москве | EVENT CREW";
const description = "Подбор хостес, промоутеров, координаторов, официантов и другого персонала для мероприятий в Москве.";
const themeStyle = {
  "--background": themeColors.background,
  "--foreground": themeColors.foreground,
  "--accent": themeColors.accent,
  "--muted": themeColors.muted,
  "--muted-on-dark": themeColors.mutedOnDark,
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
        alt: "EVENT CREW — персонал для вашего мероприятия",
      },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" style={themeStyle}>
      <body>{children}</body>
    </html>
  );
}
