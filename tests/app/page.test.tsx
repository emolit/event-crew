import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Home from "@/app/page";
import { publicContentFixture } from "@/tests/fixtures/public-content";

vi.mock("@/lib/content/repository",()=>({getPublicContent:vi.fn(async()=>publicContentFixture)}));

it("renders the inquiry form immediately before the footer", async () => {
  const { container } = render(await Home());
  expect(screen.getByRole("heading", { level: 1, name: /персонал для вашего мероприятия/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /посмотреть услуги/i })).toHaveAttribute("href", "/personnel");
  expect(container.querySelector("#services")).not.toBeInTheDocument();
  const contact = container.querySelector("#contact");
  expect(contact).toBeInTheDocument();
  expect(container.querySelector("#contacts")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /отправить заявку/i })).toBeInTheDocument();
  expect(contact?.parentElement?.lastElementChild).toBe(contact);
  expect(contact?.closest("main")?.nextElementSibling).toBe(container.querySelector("#contacts"));

  expect(container.querySelector("#clients")).not.toBeInTheDocument();
});
