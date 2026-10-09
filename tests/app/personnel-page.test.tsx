import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PersonnelPage from "@/app/personnel/page";
import { services } from "@/data/services";

describe("Personnel page", () => {
  it("keeps the floating graphite header readable", () => {
    render(<PersonnelPage />);

    expect(screen.getByRole("banner")).toHaveClass("text-white");
    expect(screen.getByRole("button", { name: /открыть меню/i })).toHaveClass(
      "border-white/20",
      "bg-white/5",
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

  it("reveals the selected role with calmer price and description typography", async () => {
    const user = userEvent.setup();
    render(<PersonnelPage />);

    await user.click(screen.getByRole("button", { name: "Подробнее: Хелперы" }));

    const card = screen.getByRole("listitem", { name: "Хелперы" });
    expect(await within(card).findByText("от 700 ₽/час")).toHaveClass(
      "font-serif",
      "text-4xl",
      "tracking-[-0.03em]",
    );
    expect(within(card).getByText(/подготовкой, навигацией и организационными задачами/i)).toHaveClass(
      "font-serif",
      "text-lg",
      "leading-7",
      "text-black/75",
    );
    expect(within(card).getByRole("link", { name: /оставить заявку/i })).toHaveAttribute("href", "#contacts");
  });

  it("flips an open card back when the same card is activated again without showing a close icon", async () => {
    const user = userEvent.setup();
    render(<PersonnelPage />);

    await user.click(screen.getByRole("button", { name: "Подробнее: Хелперы" }));

    const card = screen.getByRole("listitem", { name: "Хелперы" });
    const collapseButton = await within(card).findByRole("button", { name: "Свернуть карточку: Хелперы" });
    expect(collapseButton).toHaveAttribute("aria-expanded", "true");
    expect(within(card).queryByText("×")).not.toBeInTheDocument();

    await user.click(collapseButton);

    expect(await within(card).findByRole("button", { name: "Подробнее: Хелперы" })).toHaveAttribute("aria-expanded", "false");
    expect(within(card).queryByText("от 700 ₽/час")).not.toBeInTheDocument();
  });

  it("keeps the inquiry link usable without flipping the card back", async () => {
    const user = userEvent.setup();
    render(<PersonnelPage />);

    await user.click(screen.getByRole("button", { name: "Подробнее: Хелперы" }));

    const card = screen.getByRole("listitem", { name: "Хелперы" });
    const inquiryLink = await within(card).findByRole("link", { name: /оставить заявку/i });
    inquiryLink.addEventListener("click", (event) => event.preventDefault(), { once: true });
    await user.click(inquiryLink);

    expect(within(card).getByRole("button", { name: "Свернуть карточку: Хелперы" })).toBeInTheDocument();
  });

  it("finishes with direct contacts without exposing the inquiry form", () => {
    const { container } = render(<PersonnelPage />);

    expect(container.querySelector("#personnel-contact")).not.toBeInTheDocument();
    expect(container.querySelector("#contacts")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /не нашли, что искали/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /отправить заявку/i })).not.toBeInTheDocument();
  });
});
