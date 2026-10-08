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
  it("renders the verified contact channels as actionable links", () => {
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
    const phone = screen.getByRole("link", { name: /телефон.*\+7 985 197-56-63/i });
    const telegram = screen.getByRole("link", { name: /telegram.*@event_crew/i });
    const whatsapp = screen.getByRole("link", { name: /whatsapp.*\+7 985 197-56-63/i });
    const email = screen.getByRole("link", { name: /email.*eventcrew@bk\.ru/i });

    expect(phone).toHaveAttribute("href", "tel:+79851975663");
    expect(telegram).toHaveAttribute("href", "https://t.me/EVENT_CREW");
    expect(whatsapp).toHaveAttribute("href", "https://wa.me/79851975663");
    expect(email).toHaveAttribute("href", "mailto:eventcrew@bk.ru");

    for (const contactLink of [phone, telegram, whatsapp, email]) {
      expect(contactLink.querySelector("svg")).toBeInTheDocument();
    }

    expect(screen.getByText("© 2026 EVENT CREW. Все права защищены.")).toBeInTheDocument();

    expect(telegram).toHaveAttribute("target", "_blank");
    expect(whatsapp).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(phone).not.toHaveAttribute("target");
    expect(email).not.toHaveAttribute("target");
  });
});
