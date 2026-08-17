import { render, screen, within } from "@testing-library/react";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import { siteConfig } from "@/data/site";

describe("Hero", () => {
  it("provides the exact Hero copy, sole top-level heading, image alt, and contact CTA", () => {
    const { container } = render(<Hero />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/^Люди, на которых держится событие$/);
    expect(
      screen.getByText("Подберём и выведем на площадку хостес, координаторов, регистраторов и линейный персонал в Москве"),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /команда event crew на мероприятии/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Рассчитать команду" })).toHaveAttribute("href", "#contact");
    expect(screen.getByText("Москва / состав от 2 человек / на связи в день события")).toBeInTheDocument();
    expect(container.querySelector('[data-crew-line="hero"]')).toBeInTheDocument();
  });
});

describe("Footer", () => {
  it("renders all configured contact channels and the approved copyright", () => {
    render(<Footer />);

    expect(screen.getByRole("contentinfo")).toHaveAttribute("id", "contacts");
    expect(screen.getByRole("img", { name: "Логотип EVENT CREW" })).toHaveAttribute(
      "src",
      expect.stringContaining(encodeURIComponent(siteConfig.logo)),
    );
    const footerNavigation = screen.getByRole("navigation", { name: "Навигация в подвале" });
    for (const item of siteConfig.nav) {
      expect(within(footerNavigation).getByRole("link", { name: item.label })).toHaveAttribute(
        "href",
        item.href,
      );
    }
    for (const contact of Object.values(siteConfig.contacts)) {
      expect(screen.getByRole("link", { name: new RegExp(contact.label, "i") })).toHaveAttribute("href", contact.href);
    }
    expect(screen.getByText("© 2026 EVENT CREW. Все права защищены.")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /telegram/i })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: /whatsapp/i })).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.getByRole("link", { name: /телефон/i })).not.toHaveAttribute("target");
    expect(screen.getByRole("link", { name: /email/i })).not.toHaveAttribute("target");
  });
});
