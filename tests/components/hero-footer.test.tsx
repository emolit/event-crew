import { render, screen, within } from "@testing-library/react";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import { siteConfig } from "@/data/site";

describe("Hero", () => {
  it("presents the event team offer over the configured background image", () => {
    render(<Hero />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/^Персонал для вашего мероприятия$/);
    expect(screen.getByText("Хелперы, хостес, промоутеры, официанты и другой персонал.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /подготовка площадки event crew/i })).toHaveAttribute(
      "src",
      expect.stringContaining(encodeURIComponent(siteConfig.heroImage)),
    );
  });

  it("offers direct navigation to the contact form and services", () => {
    render(<Hero />);

    expect(screen.getByRole("link", { name: "Рассчитать стоимость" })).toHaveAttribute("href", "#contact");
    expect(screen.getByRole("link", { name: "Посмотреть услуги" })).toHaveAttribute("href", "/personnel");
  });

  it("shows the three approved proof points on arrival", () => {
    render(<Hero />);

    const metrics = screen.getByRole("list", { name: "EVENT CREW в цифрах" });
    expect(within(metrics).getByText("100+")).toBeInTheDocument();
    expect(within(metrics).getByText("мероприятий")).toBeInTheDocument();
    expect(within(metrics).getByText("400+")).toBeInTheDocument();
    expect(within(metrics).getByText("база сотрудников")).toBeInTheDocument();
    expect(within(metrics).getByText("15 мин")).toBeInTheDocument();
    expect(within(metrics).getByText("первичный расчёт")).toBeInTheDocument();
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
