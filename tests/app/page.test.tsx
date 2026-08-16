import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

it("renders the EVENT CREW primary heading", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { level: 1, name: /персонал для вашего мероприятия/i })).toBeInTheDocument();
});
