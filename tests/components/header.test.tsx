import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "@/components/Header";
import { siteConfig } from "@/data/site";

describe("Header", () => {
  it("uses the selected floating graphite treatment", () => {
    render(<Header />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("px-3", "pt-3", "text-white");
    expect(header.firstElementChild).toHaveClass(
      "rounded-sm",
      "border-white/15",
      "bg-[color:var(--foreground)]/90",
      "backdrop-blur-xl",
    );
    expect(screen.getByRole("button", { name: /открыть меню/i })).toHaveClass(
      "border-white/20",
      "bg-white/5",
      "text-white",
    );
  });

  it("keeps the compact menu through laptop widths where full navigation would clip", () => {
    render(<Header />);

    expect(screen.getByRole("navigation", { name: /основная навигация/i })).toHaveClass("xl:flex");
    expect(screen.getByRole("link", { name: /оставить заявку/i })).toHaveClass("xl:inline-flex");
    expect(screen.getByRole("button", { name: /открыть меню/i })).toHaveClass("xl:hidden");
  });

  it("renders configured navigation and opens a dismissible mobile menu", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Header />
        <main data-testid="page-main" />
        <footer data-testid="page-footer" />
      </>,
    );

    const navigation = screen.getByRole("navigation", { name: /основная навигация/i });
    for (const item of siteConfig.nav) {
      expect(navigation).toHaveTextContent(item.label);
    }
    expect(screen.getByRole("link", { name: /оставить заявку/i })).toHaveAttribute("href", "#contacts");
    expect(within(navigation).getByRole("link", { name: "Персонал" })).toHaveAttribute("href", "/personnel");

    const toggle = screen.getByRole("button", { name: /открыть меню/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: /мобильная навигация/i })).toBeInTheDocument();
    expect(document.body).toHaveStyle({ overflow: "hidden" });

    const mobileMenu = screen.getByRole("dialog", { name: /мобильная навигация/i });
    expect(within(mobileMenu).getByRole("link", { name: /оставить заявку/i })).toHaveAttribute("href", "#contacts");
    expect(mobileMenu).toHaveClass("fixed", "inset-0", "overflow-y-auto");
    expect(screen.getByTestId("page-main")).toHaveAttribute("inert");
    expect(screen.getByTestId("page-footer")).toHaveAttribute("inert");
    const closeButton = within(mobileMenu).getByRole("button", { name: /закрыть меню/i });
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(within(mobileMenu).getByRole("link", { name: /оставить заявку/i })).toHaveFocus();
    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /мобильная навигация/i })).not.toBeInTheDocument();
    });
    expect(toggle).toHaveFocus();
    expect(document.body).not.toHaveStyle({ overflow: "hidden" });
    expect(screen.getByTestId("page-main")).not.toHaveAttribute("inert");
    expect(screen.getByTestId("page-footer")).not.toHaveAttribute("inert");
  });

  it("closes the mobile menu when navigation is selected", async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole("button", { name: /открыть меню/i }));
    const personnelLink = within(screen.getByRole("dialog", { name: /мобильная навигация/i })).getByRole("link", { name: "Персонал" });
    personnelLink.addEventListener("click", (event) => event.preventDefault(), { once: true });
    await user.click(personnelLink);

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /мобильная навигация/i })).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /открыть меню/i })).toHaveFocus();
  });

  it("restores background inert state when the header unmounts", async () => {
    const user = userEvent.setup();
    const pageMain = document.createElement("main");
    const pageFooter = document.createElement("footer");
    document.body.append(pageMain, pageFooter);
    const { unmount } = render(<Header />);

    await user.click(screen.getByRole("button", { name: /открыть меню/i }));
    expect(pageMain).toHaveAttribute("inert");
    expect(pageFooter).toHaveAttribute("inert");

    unmount();
    expect(pageMain).not.toHaveAttribute("inert");
    expect(pageFooter).not.toHaveAttribute("inert");
    pageMain.remove();
    pageFooter.remove();
  });
});
