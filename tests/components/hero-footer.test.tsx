import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import { siteConfig } from "@/data/site";

describe("Hero", () => {
  it("provides the page's only top-level heading, image alt text, and contact CTA", () => {
    render(<Hero />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Персонал для вашего мероприятия");
    expect(screen.getByRole("img", { name: /команда event crew на мероприятии/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /оставить заявку/i })).toHaveAttribute("href", "#contact");
  });
});

describe("Footer", () => {
  it("renders all configured contact channels and the approved copyright", () => {
    render(<Footer />);

    expect(screen.getByRole("contentinfo")).toHaveAttribute("id", "contacts");
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
