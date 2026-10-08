import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

it("renders the EVENT CREW primary heading", () => {
  const { container } = render(<Home />);
  expect(screen.getByRole("heading", { level: 1, name: /персонал для вашего мероприятия/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /посмотреть услуги/i })).toHaveAttribute("href", "/personnel");
  expect(container.querySelector("#services")).not.toBeInTheDocument();
  expect(container.querySelector("#contact")).toBeInTheDocument();
});
