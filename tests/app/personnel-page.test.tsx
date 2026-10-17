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

  it("uses one calm studio treatment and equal proportions for every front card", () => {
    render(<PersonnelPage />);

    const list = screen.getByRole("list", { name: /виды персонала/i });
    for (const service of services) {
      const card = within(list).getByRole("listitem", { name: service.name });
      const front = within(card).getByRole("button", { name: `Подробнее: ${service.name}` });
      const portrait = within(card).getByRole("img", { name: service.alt });

      expect(card).toHaveClass("aspect-[4/5]", "min-h-0");
      expect(front).toHaveClass("bg-[#e8e6df]", "text-black");
      expect(portrait).toHaveClass("object-contain", "object-bottom");
    }
  });

  it("aligns crisp borderless SVG arrows with every personnel name", () => {
    render(<PersonnelPage />);

    const list = screen.getByRole("list", { name: /виды персонала/i });
    for (const service of services) {
      const card = within(list).getByRole("listitem", { name: service.name });
      expect(within(card).getByTestId(`personnel-caption-${service.id}`)).toHaveClass(
        "grid",
        "min-h-28",
        "items-end",
      );
      expect(within(card).getByTestId(`personnel-caption-${service.id}`)).toHaveStyle({
        gridTemplateColumns: "minmax(0, 1fr) 1.5rem",
      });
      expect(within(card).getByText(service.name)).toHaveClass(
        "min-w-0",
        "break-normal",
        "text-lg",
        "leading-[0.95]",
      );
      const arrow = within(card).getByTestId(`personnel-arrow-${service.id}`);
      expect(arrow).not.toHaveClass("border");
      const icon = arrow.querySelector("svg");
      expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
      expect(icon).toHaveClass("size-6");
      expect(arrow).not.toHaveTextContent("↗");
    }
  });

  it("keeps a long waiter description and its inquiry action inside the fixed card", async () => {
    const user = userEvent.setup();
    render(<PersonnelPage />);

    await user.click(screen.getByRole("button", { name: "Подробнее: Официанты" }));

    const card = screen.getByRole("listitem", { name: "Официанты" });
    expect(await within(card).findByText("от 700 ₽/час")).toHaveClass(
      "font-serif",
      "text-3xl",
      "tracking-[-0.03em]",
    );
    expect(within(card).getByText(/внимательное обслуживание гостей/i)).toHaveClass(
      "font-serif",
      "text-base",
      "leading-[1.35]",
      "text-black/75",
    );
    expect(within(card).getByRole("link", { name: /оставить заявку/i })).toHaveClass(
      "min-h-10",
      "shrink-0",
    );
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
