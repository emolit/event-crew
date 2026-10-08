import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PersonnelPage from "@/app/personnel/page";
import { services } from "@/data/services";

describe("Personnel page", () => {
  it("keeps the light header navigation dark and readable", () => {
    render(<PersonnelPage />);

    expect(screen.getByRole("banner")).toHaveClass("text-[color:var(--foreground)]");
    expect(screen.getByRole("button", { name: /открыть меню/i })).toHaveClass(
      "bg-[color:var(--foreground)]",
      "text-white",
    );
  });

  it("presents all eight personnel cards without showing prices on their front faces", () => {
    render(<PersonnelPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Персонал" })).toBeInTheDocument();
    const list = screen.getByRole("list", { name: /виды персонала/i });
    expect(within(list).getAllByRole("listitem")).toHaveLength(8);

    for (const service of services) {
      const card = within(list).getByRole("listitem", { name: service.name });
      const imageSource = within(card).getByRole("img", { name: service.alt }).getAttribute("src") ?? "";
      expect(decodeURIComponent(imageSource)).toContain(service.image);
      expect(within(card).getByRole("button", { name: `Подробнее: ${service.name}` })).toHaveAttribute("aria-expanded", "false");
    }

    expect(within(list).queryByText(/₽\/час/i)).not.toBeInTheDocument();
  });

  it("reserves the same caption area for short and multiline personnel names", () => {
    render(<PersonnelPage />);

    const list = screen.getByRole("list", { name: /виды персонала/i });
    for (const service of services) {
      const card = within(list).getByRole("listitem", { name: service.name });
      expect(within(card).getByTestId(`personnel-caption-${service.id}`)).toHaveClass(
        "grid",
        "min-h-28",
        "grid-cols-[minmax(0,1fr)_2.75rem]",
        "items-end",
      );
      expect(within(card).getByText(service.name)).toHaveClass(
        "min-w-0",
        "break-normal",
        "text-lg",
        "leading-[0.95]",
      );
    }
  });

  it("reveals the selected role description and price after a card is activated", async () => {
    const user = userEvent.setup();
    render(<PersonnelPage />);

    await user.click(screen.getByRole("button", { name: "Подробнее: Хелперы" }));

    const card = screen.getByRole("listitem", { name: "Хелперы" });
    expect(await within(card).findByText("от 700 ₽/час")).toBeInTheDocument();
    expect(within(card).getByText(/подготовкой, навигацией и организационными задачами/i)).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: /оставить заявку/i })).toHaveAttribute("href", "#personnel-contact");
    expect(within(card).getByRole("button", { name: "Вернуться: Хелперы" })).toHaveAttribute("aria-expanded", "true");
  });

  it("finishes with the Telegram-backed inquiry form", () => {
    const { container } = render(<PersonnelPage />);

    expect(screen.getByRole("heading", { level: 2, name: /не нашли, что искали/i })).toBeInTheDocument();
    expect(container.querySelector("#personnel-contact")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /отправить заявку/i })).toBeInTheDocument();
  });
});
