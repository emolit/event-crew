import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, vi } from "vitest";
import Advantages from "@/components/Advantages";
import Process from "@/components/Process";
import Projects from "@/components/Projects";
import Services from "@/components/Services";
import { advantages } from "@/data/advantages";
import { processSteps } from "@/data/process";
import { projects } from "@/data/projects";
import { services } from "@/data/services";

afterEach(() => vi.useRealTimers());

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

  it("renders every project without the former category labels", () => {
    render(<Projects />);

    const section = screen.getByRole("region", { name: /проекты/i });
    expect(section).toHaveAttribute("id", "projects");
    expect(within(section).getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(within(section).getAllByRole("article")).toHaveLength(5);
    expect(within(section).queryByText("На площадке")).not.toBeInTheDocument();
    expect(
      within(section).getByText(
        "Представляем малую часть проектов, которые стали возможны благодаря работе нашей команды.",
      ),
    ).toBeInTheDocument();

    for (const project of projects) {
      const projectCard = within(section).getByRole("article", { name: project.title });
      expect(within(projectCard).queryByText(project.type)).not.toBeInTheDocument();
      expect(within(projectCard).getByRole("img", { name: project.alt })).toHaveAttribute("alt", project.alt);
      for (const role of project.roles) {
        expect(within(projectCard).getByText(role)).toBeInTheDocument();
      }
    }
  });

  it("slides through the brand-zone photos without opening its description", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const card = screen.getByRole("article", { name: "Бренд-зона" });
    expect(within(card).getByRole("img")).toHaveAttribute("src", expect.stringContaining("brand-zone-01.jpg"));

    await user.click(within(card).getByRole("button", { name: "Следующая фотография проекта Бренд-зона" }));

    expect(
      within(card)
        .getAllByRole("img")
        .some((image) => image.getAttribute("src")?.includes("brand-zone-02.jpg")),
    ).toBe(true);
    expect(within(card).queryByText(/DOBROFEST 2026/)).not.toBeInTheDocument();
  });

  it("auto-slides project galleries in two alternating groups", () => {
    vi.useFakeTimers();
    render(<Projects />);

    const brandZone = screen.getByRole("article", { name: "Бренд-зона" });
    const bicycleFestival = screen.getByRole("article", { name: "Вело-фестиваль" });
    const festival = screen.getByRole("article", { name: "Фестиваль" });
    const privateEvent = screen.getByRole("article", { name: "Частное торжество" });
    const conference = screen.getByRole("article", { name: "Конференция" });

    act(() => vi.advanceTimersByTime(5_000));

    expect(within(brandZone).getAllByRole("img").some((image) => image.getAttribute("src")?.includes("brand-zone-02.jpg"))).toBe(true);
    expect(
      within(bicycleFestival)
        .getAllByRole("img")
        .some((image) => image.getAttribute("src")?.includes("bicycle-festival-02.jpg")),
    ).toBe(true);
    expect(within(festival).getAllByRole("img").some((image) => image.getAttribute("src")?.includes("festival-02.jpg"))).toBe(false);
    expect(within(privateEvent).getAllByRole("img").some((image) => image.getAttribute("src")?.includes("private-event-02.jpg"))).toBe(false);
    expect(within(conference).getAllByRole("img").some((image) => image.getAttribute("src")?.includes("conference-02.jpg"))).toBe(false);

    act(() => vi.advanceTimersByTime(2_500));

    expect(within(festival).getAllByRole("img").some((image) => image.getAttribute("src")?.includes("festival-02.jpg"))).toBe(true);
    expect(within(privateEvent).getAllByRole("img").some((image) => image.getAttribute("src")?.includes("private-event-02.jpg"))).toBe(true);
    expect(within(conference).getAllByRole("img").some((image) => image.getAttribute("src")?.includes("conference-02.jpg"))).toBe(true);
  });

  it("uses icon-only chevrons for the brand-zone gallery controls", () => {
    render(<Projects />);

    const card = screen.getByRole("article", { name: "Бренд-зона" });
    const previous = within(card).getByRole("button", { name: "Предыдущая фотография проекта Бренд-зона" });
    const next = within(card).getByRole("button", { name: "Следующая фотография проекта Бренд-зона" });

    expect(previous.textContent).toBe("");
    expect(next.textContent).toBe("");
    expect(previous.querySelector("svg")).toBeInTheDocument();
    expect(next.querySelector("svg")).toBeInTheDocument();
  });

  it("releases a gallery arrow focus after mouse interaction", () => {
    render(<Projects />);

    const card = screen.getByRole("article", { name: "Бренд-зона" });
    const next = within(card).getByRole("button", { name: "Следующая фотография проекта Бренд-зона" });
    next.focus();
    expect(next).toHaveFocus();

    fireEvent.mouseUp(next);

    expect(next).not.toHaveFocus();
  });

  it("does not reveal gallery arrows when focus returns to the project card", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const card = screen.getByRole("article", { name: "Бренд-зона" });
    const toggle = within(card).getByRole("button", { name: "Открыть описание проекта Бренд-зона" });
    await user.click(toggle);
    await user.click(screen.getByRole("button", { name: "Вернуться к проектам" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    expect(toggle).toHaveFocus();
    const arrows = within(card).getByRole("button", { name: "Следующая фотография проекта Бренд-зона" }).parentElement;
    expect(arrows).toHaveClass("md:focus-within:opacity-100");
    expect(arrows).not.toHaveClass("md:group-focus-within:opacity-100");
  });

  it("opens the brand-zone description in a compact dark dialog", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const card = screen.getByRole("article", { name: "Бренд-зона" });
    const toggle = within(card).getByRole("button", { name: "Открыть описание проекта Бренд-зона" });
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(within(card).getByRole("img")).toBeInTheDocument();
    const dialog = screen.getByRole("dialog", {
      name: "DOBROFEST 2026 | Организация фестивальной бренд-зоны",
    });
    expect(dialog).toHaveAttribute("data-theme", "dark");
    expect(dialog).toHaveClass("bg-[color:var(--foreground)]");
    expect(dialog).toHaveAttribute("style", expect.stringContaining("max-width: 44rem"));
    expect(dialog).toHaveAttribute("style", expect.stringContaining("max-height: 78vh"));
    expect(screen.getByRole("button", { name: "Закрыть описание проекта Бренд-зона" })).toHaveClass("bg-black/70");
    expect(
      within(dialog).getByRole("heading", {
        name: "DOBROFEST 2026 | Организация фестивальной бренд-зоны",
      }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        "От подготовки площадки до общения с гостями — участие в создании яркого фестивального пространства. Помощь на монтаже и демонтаже бренд-зоны, поддержка интерактивных активностей и помощь в организации мероприятия, которое объединяет музыку, эмоции и людей.",
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Хелперы • Промоутеры • Охрана")).toBeInTheDocument();

    const returnButton = within(dialog).getByRole("button", { name: "Вернуться к проектам" });
    expect(returnButton).toHaveClass("text-[color:var(--foreground)]");
    await user.click(returnButton);

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("opens the festival description with the same dark treatment and heading style", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const card = screen.getByRole("article", { name: "Фестиваль" });
    await user.click(within(card).getByRole("button", { name: "Открыть описание проекта Фестиваль" }));

    const dialog = screen.getByRole("dialog", {
      name: "Фестиваль «Летник» | 29.05–31.05, Москва ☀️",
    });
    const brandHeadingClasses = "mt-7 max-w-2xl text-2xl font-black uppercase leading-[1.02] tracking-[-0.045em] sm:text-3xl";
    expect(dialog).toHaveAttribute("data-theme", "dark");
    expect(dialog).toHaveClass("bg-[color:var(--foreground)]", "text-white");
    expect(within(dialog).getByRole("heading")).toHaveClass(...brandHeadingClasses.split(" "));
    expect(
      within(dialog).getByText(
        "Три дня музыки, ярких эмоций и летней атмосферы! «Летник» — фестиваль, созданный командой P2P при поддержке наших хелперов, которые помогали воплощать идею в жизнь. Участие в организации события, помощь в подготовке площадки и поддержании её работы — вклад в создание пространства, где каждый гость мог стать частью большого летнего праздника.",
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Хелперы • Промоутеры")).toBeInTheDocument();
  });

  it("opens the conference project with its approved content", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const card = screen.getByRole("article", { name: "Конференция" });
    expect(within(card).getByRole("img")).toHaveAttribute("src", expect.stringContaining("conference-01.jpg"));
    await user.click(within(card).getByRole("button", { name: "Открыть описание проекта Конференция" }));

    const dialog = screen.getByRole("dialog", {
      name: "Конференция",
    });
    expect(dialog).toHaveAttribute("data-theme", "dark");
    expect(
      within(dialog).getByText(
        "Ежегодно предоставляем персонал для организации и проведения мероприятия для сотрудников компании. Программа включает конференцию, церемонию награждения и завершается гала-ужином.",
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Хелперы • Официанты")).toBeInTheDocument();
  });

  it("opens the private celebration with its approved content and first photo", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const card = screen.getByRole("article", { name: "Частное торжество" });
    expect(within(card).getByRole("img")).toHaveAttribute("src", expect.stringContaining("private-event-01.jpg"));
    await user.click(within(card).getByRole("button", { name: "Открыть описание проекта Частное торжество" }));

    const dialog = screen.getByRole("dialog", { name: "Частное торжество" });
    expect(within(dialog).getByText(/Как правило, это закрытые корпоративные мероприятия/)).toHaveClass(
      "whitespace-pre-line",
    );
    expect(within(dialog).getByText("Хостес • Хелперы • Охрана • Гардеробщики")).toBeInTheDocument();
  });

  it("opens the bicycle festival with its approved content and first photo", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const card = screen.getByRole("article", { name: "Вело-фестиваль" });
    expect(within(card).getByRole("img")).toHaveAttribute("src", expect.stringContaining("bicycle-festival-01.jpg"));
    await user.click(within(card).getByRole("button", { name: "Открыть описание проекта Вело-фестиваль" }));

    const dialog = screen.getByRole("dialog", { name: "Гранд-тур «Пятёрочка» | 22–23 августа, Яхрома" });
    expect(within(dialog).getByText(/Два дня драйва, активности и командной работы/)).toBeInTheDocument();
    expect(within(dialog).getByText("Хелперы")).toBeInTheDocument();
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
