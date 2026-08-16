import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EVENT CREW",
  description: "Персонал для вашего мероприятия",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
