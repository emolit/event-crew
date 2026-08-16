import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "@/components/Header";
import { siteConfig } from "@/data/site";

describe("Header", () => {
  it("renders configured navigation and opens a dismissible mobile menu", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const navigation = screen.getByRole("navigation", { name: /основная навигация/i });
    for (const item of siteConfig.nav) {
      expect(navigation).toHaveTextContent(item.label);
    }
    expect(screen.getByRole("link", { name: /оставить заявку/i })).toHaveAttribute("href", "#contact");

    const toggle = screen.getByRole("button", { name: /открыть меню/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: /мобильная навигация/i })).toBeInTheDocument();
    expect(document.body).toHaveStyle({ overflow: "hidden" });

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: /мобильная навигация/i })).not.toBeInTheDocument();
    expect(toggle).toHaveFocus();
    expect(document.body).not.toHaveStyle({ overflow: "hidden" });
  });

  it("closes the mobile menu when navigation is selected", async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole("button", { name: /открыть меню/i }));
    await user.click(within(screen.getByRole("dialog", { name: /мобильная навигация/i })).getByRole("link", { name: "Услуги" }));

    expect(screen.queryByRole("dialog", { name: /мобильная навигация/i })).not.toBeInTheDocument();
  });
});
