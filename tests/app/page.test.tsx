import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Home from "@/app/page";
import { publicContentFixture } from "@/tests/fixtures/public-content";

vi.mock("@/lib/content/repository",()=>({getPublicContent:vi.fn(async()=>publicContentFixture)}));

it("renders the EVENT CREW landing page without exposing the inquiry form", async () => {
  const { container } = render(await Home());
  expect(screen.getByRole("heading", { level: 1, name: /персонал для вашего мероприятия/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /посмотреть услуги/i })).toHaveAttribute("href", "/personnel");
  expect(container.querySelector("#services")).not.toBeInTheDocument();
  expect(container.querySelector("#contact")).not.toBeInTheDocument();
  expect(container.querySelector("#contacts")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /отправить заявку/i })).not.toBeInTheDocument();

  expect(container.querySelector("#clients")).not.toBeInTheDocument();
});
