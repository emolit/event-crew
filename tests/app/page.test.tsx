import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

it("renders the EVENT CREW primary heading", () => {
  const { container } = render(<Home />);
  expect(screen.getByRole("heading", { level: 1, name: /люди, на которых держится событие/i })).toBeInTheDocument();
  expect(container.querySelector("#contact")).toBeInTheDocument();
});
