import { render, screen, within } from "@testing-library/react";
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

    const section = screen.getByRole("region", { name: /услуги/i });
    expect(section).toHaveAttribute("id", "services");
    expect(within(section).getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(within(section).getAllByRole("article")).toHaveLength(8);

    for (const service of services) {
      expect(within(section).getByRole("heading", { name: service.name, level: 3 })).toBeInTheDocument();
      const image = within(section).getByRole("img", { name: service.alt });
      expect(image).toHaveAttribute("alt", service.alt);
      expect(image).toHaveAttribute("sizes", "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw");
      expect(image.parentElement).toHaveClass("aspect-[2/3]");
    }
  });

  it("renders all four advantages and states its Moscow-only scope", () => {
    render(<Advantages />);

    const section = screen.getByRole("region", { name: /почему мы/i });
    expect(section).toHaveAttribute("id", "advantages");
    expect(within(section).getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(within(section).getAllByRole("article")).toHaveLength(4);
    expect(within(section).getByText("Работаем с мероприятиями в Москве")).toBeInTheDocument();

    for (const advantage of advantages) {
      expect(within(section).getByRole("heading", { name: advantage.title, level: 3 })).toBeInTheDocument();
    }
  });

  it("renders every project with its type, roles, and non-empty local image alternative", () => {
    render(<Projects />);

    const section = screen.getByRole("region", { name: /проекты/i });
    expect(section).toHaveAttribute("id", "projects");
    expect(within(section).getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(within(section).getAllByRole("article")).toHaveLength(5);

    for (const project of projects) {
      const projectCard = within(section).getByRole("article", { name: project.title });
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

    const section = screen.getByRole("region", { name: /как мы работаем/i });
    expect(section).toHaveAttribute("id", "process");
    expect(within(section).getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(within(section).getAllByRole("article")).toHaveLength(4);

    for (const step of processSteps) {
      const stepCard = within(section).getByRole("article", { name: new RegExp(`${step.number}.*${step.title}`, "i") });
      expect(within(stepCard).getByText(step.number)).toHaveClass(
        "bg-[color:var(--accent)]",
        "text-[color:var(--foreground)]",
      );
      expect(within(stepCard).getByRole("heading", { name: step.title, level: 3 })).toBeInTheDocument();
    }

    expect(container.textContent).not.toMatch(/1000|100 мероприятий|10 городов|отзывы/i);
  });
});
