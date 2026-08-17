import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Advantages from "@/components/Advantages";
import Process from "@/components/Process";
import Projects from "@/components/Projects";
import Services from "@/components/Services";
import { advantages } from "@/data/advantages";
import { processSteps } from "@/data/process";
import { projects } from "@/data/projects";
import { services } from "@/data/services";

describe("data-driven content sections", () => {
  it("renders every configured service with its local image alternative", () => {
    render(<Services />);

    const section = screen.getByRole("region", { name: /кого выводим на площадку/i });
    expect(section).toHaveAttribute("id", "services");
    expect(within(section).getByRole("heading", { level: 2 })).toBeInTheDocument();
    const mobileRoster = within(section).getByRole("list", { name: "Состав команды: карточки" });
    expect(within(mobileRoster).getAllByRole("listitem")).toHaveLength(8);

    for (const service of services) {
      expect(within(mobileRoster).getByRole("heading", { name: service.name, level: 3 })).toBeInTheDocument();
      const image = within(mobileRoster).getByRole("img", { name: service.alt });
      expect(image).toHaveAttribute("alt", service.alt);
      expect(image).toHaveAttribute("sizes", "(min-width: 640px) 50vw, 100vw");
      expect(image.parentElement).toHaveClass("aspect-[2/3]");
    }
  });

  it("changes the desktop roster image on hover and keyboard focus", async () => {
    const user = userEvent.setup();
    render(<Services />);

    const roster = screen.getByRole("list", { name: "Состав команды: выбор роли" });
    const stage = screen.getByTestId("service-stage");
    const firstRole = within(roster).getByRole("button", { name: `Показать: ${services[0].name}` });
    const secondRole = within(roster).getByRole("button", { name: `Показать: ${services[1].name}` });

    expect(firstRole).toHaveAttribute("aria-pressed", "true");
    expect(stage).toHaveAttribute("data-active-service", services[0].id);

    await user.hover(secondRole);
    expect(secondRole).toHaveAttribute("aria-pressed", "true");
    expect(stage).toHaveAttribute("data-active-service", services[1].id);

    await user.tab();
    expect(firstRole).toHaveFocus();
    expect(firstRole).toHaveAttribute("aria-pressed", "true");
    expect(stage).toHaveAttribute("data-active-service", services[0].id);
  });

  it("renders all four advantages and states its Moscow-only scope", () => {
    render(<Advantages />);

    const section = screen.getByRole("region", { name: /что держим под контролем/i });
    expect(section).toHaveAttribute("id", "advantages");
    expect(within(section).getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(within(section).getByRole("list", { name: /контроль выхода команды/i })).toBeInTheDocument();
    expect(within(section).getAllByRole("listitem")).toHaveLength(4);
    expect(within(section).getByText("Работаем с мероприятиями в Москве")).toBeInTheDocument();

    for (const advantage of advantages) {
      expect(within(section).getByRole("heading", { name: advantage.title, level: 3 })).toBeInTheDocument();
    }
  });

  it("renders every project with its type, roles, and non-empty local image alternative", () => {
    render(<Projects />);

    const section = screen.getByRole("region", { name: /команды на площадке/i });
    expect(section).toHaveAttribute("id", "projects");
    expect(within(section).getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(within(section).getAllByRole("article")).toHaveLength(6);

    for (const project of projects) {
      const projectCard = within(section).getByRole("article", { name: project.title });
      expect(within(projectCard).getByTestId("project-caption")).toBeInTheDocument();
      expect(within(projectCard).getByText(project.type)).toBeInTheDocument();
      expect(within(projectCard).getByRole("img", { name: project.alt })).toHaveAttribute("alt", project.alt);
      for (const role of project.roles) {
        expect(within(projectCard).getByText(role)).toBeInTheDocument();
      }
    }
  });

  it("renders the four numbered process steps without unsupported claims", () => {
    const { container } = render(
      <>
        <Services />
        <Advantages />
        <Projects />
        <Process />
      </>,
    );

    const section = screen.getByRole("region", { name: /от брифа до выхода/i });
    expect(section).toHaveAttribute("id", "process");
    expect(within(section).getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(within(section).getAllByRole("article")).toHaveLength(4);

    for (const step of processSteps) {
      const stepCard = within(section).getByRole("article", { name: new RegExp(`${step.number}.*${step.title}`, "i") });
      expect(within(stepCard).getByText(step.number)).toHaveAttribute("data-timeline-marker");
      expect(within(stepCard).getByRole("heading", { name: step.title, level: 3 })).toBeInTheDocument();
    }

    expect(container.textContent).not.toMatch(/1000|100 мероприятий|10 городов|отзывы/i);
  });
});
