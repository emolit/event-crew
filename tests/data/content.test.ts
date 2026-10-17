import { describe, expect, it } from "vitest";

import { advantages } from "@/data/advantages";
import { processSteps } from "@/data/process";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { siteConfig } from "@/data/site";

describe("landing content contracts", () => {
  it("provides the complete landing content", () => {
    expect(services).toHaveLength(8);
    expect(advantages).toHaveLength(4);
    expect(projects).toHaveLength(5);
    expect(processSteps.map((step) => step.number)).toEqual(["01", "02", "03", "04"]);
    expect(siteConfig.brand).toBe("EVENT CREW");
  });

  it("keeps all content images local and replaceable", () => {
    const paths = [siteConfig.heroImage, ...services.map((service) => service.image), ...projects.map((project) => project.image)];
    expect(paths.every((path) => path.startsWith("/images/"))).toBe(true);
  });

  it("keeps the exact stable service ids and replacement paths", () => {
    expect(services.map((service) => service.id)).toEqual([
      "helpers",
      "promoters",
      "hostess",
      "waiters",
      "coordinators",
      "cloakroom",
      "security",
      "riggers",
    ]);
    expect(services.map((service) => service.price)).toEqual([700, 750, 850, 700, 850, 600, 700, 700]);
    expect(services.map((service) => service.image)).toEqual([
      "/images/services/personnel-helpers.webp",
      "/images/services/personnel-promoters.webp",
      "/images/services/personnel-hostess.webp",
      "/images/services/personnel-waiters.webp",
      "/images/services/personnel-coordinators.webp",
      "/images/services/personnel-cloakroom.webp",
      "/images/services/personnel-security.webp",
      "/images/services/personnel-riggers.webp",
    ]);
  });

  it("keeps the approved process descriptions", () => {
    expect(processSteps.map((step) => step.description)).toEqual([
      "Обсуждаем мероприятие, площадку и задачи.",
      "Подбираем команду под формат события.",
      "Согласовываем состав, график и условия работы.",
      "Выходим на площадку и обеспечиваем слаженную работу.",
    ]);
  });

  it("configures the DOBROFEST brand zone as a three-photo project", () => {
    expect(projects[0]).toMatchObject({
      id: "project-01",
      title: "Бренд-зона",
      detailTitle: "DOBROFEST 2026 | Организация фестивальной бренд-зоны",
      description:
        "От подготовки площадки до общения с гостями — участие в создании яркого фестивального пространства. Помощь на монтаже и демонтаже бренд-зоны, поддержка интерактивных активностей и помощь в организации мероприятия, которое объединяет музыку, эмоции и людей.",
      roles: ["Хелперы", "Промоутеры", "Охрана"],
      images: [
        "/images/projects/brand-zone-01.jpg",
        "/images/projects/brand-zone-02.jpg",
        "/images/projects/brand-zone-03.jpg",
      ],
    });
  });

  it("configures the Letnik festival as a three-photo project", () => {
    expect(projects[1]).toMatchObject({
      id: "project-02",
      title: "Фестиваль",
      detailTitle: "Фестиваль «Летник» | 29.05–31.05, Москва ☀️",
      description:
        "Три дня музыки, ярких эмоций и летней атмосферы! «Летник» — фестиваль, созданный командой P2P при поддержке наших хелперов, которые помогали воплощать идею в жизнь. Участие в организации события, помощь в подготовке площадки и поддержании её работы — вклад в создание пространства, где каждый гость мог стать частью большого летнего праздника.",
      roles: ["Хелперы", "Промоутеры"],
      images: [
        "/images/projects/festival-01.jpg",
        "/images/projects/festival-02.jpg",
        "/images/projects/festival-03.jpg",
      ],
    });
  });

  it("configures the conference as a two-photo project", () => {
    expect(projects[2]).toMatchObject({
      id: "project-06",
      title: "Конференция",
      detailTitle: "Конференция",
      description:
        "Ежегодно предоставляем персонал для организации и проведения мероприятия для сотрудников компании. Программа включает конференцию, церемонию награждения и завершается гала-ужином.",
      roles: ["Хелперы", "Официанты"],
      images: [
        "/images/projects/conference-01.jpg",
        "/images/projects/conference-02.jpg",
      ],
    });
  });

  it("configures the private celebration as a two-photo project", () => {
    expect(projects[3]).toMatchObject({
      id: "project-04",
      title: "Частное торжество",
      detailTitle: "Частное торжество",
      description:
        "Как правило, это закрытые корпоративные мероприятия, не предназначенные для широкой публики. Поэтому мы кратко расскажем о нашем опыте, не раскрывая названий и подробностей событий.\n\nДни рождения, юбилеи и другие торжества сложно представить без профессионального персонала, который помогает создать комфортную атмосферу и обеспечить высокий уровень обслуживания на протяжении всего мероприятия.",
      roles: ["Хостес", "Хелперы", "Охрана", "Гардеробщики"],
      image: "/images/projects/private-event-01.jpg",
      images: [
        "/images/projects/private-event-01.jpg",
        "/images/projects/private-event-02.jpg",
      ],
    });
  });

  it("configures the bicycle festival as a three-photo project", () => {
    expect(projects[4]).toMatchObject({
      id: "project-05",
      title: "Вело-фестиваль",
      detailTitle: "Гранд-тур «Пятёрочка» | 22–23 августа, Яхрома",
      description:
        "Два дня драйва, активности и командной работы! Команда из 15 хелперов помогала в застройке площадки, сопровождении мероприятия и демонтаже.\n\nВ первый день гости наслаждались фестивалем, бренд-зонами и интерактивами, а во второй состоялись велозаезды, церемония награждения и выступление артиста. Мы рады стать частью этого яркого события!",
      roles: ["Хелперы"],
      image: "/images/projects/bicycle-festival-01.jpg",
      images: [
        "/images/projects/bicycle-festival-01.jpg",
        "/images/projects/bicycle-festival-02.jpg",
        "/images/projects/bicycle-festival-03.jpg",
      ],
    });
  });

  it("keeps the approved project-card mosaic", () => {
    expect(projects.map((project) => project.size)).toEqual([
      "wide",
      "standard",
      "tall",
      "standard",
      "wide",
    ]);
  });

  it("keeps stable project ids while replacing the exhibition with the conference", () => {
    expect(projects.map((project) => project.id)).toEqual([
      "project-01",
      "project-02",
      "project-06",
      "project-04",
      "project-05",
    ]);
    expect(projects.map((project) => project.image)).toEqual([
      "/images/projects/brand-zone-01.jpg",
      "/images/projects/festival-01.jpg",
      "/images/projects/conference-01.jpg",
      "/images/projects/private-event-01.jpg",
      "/images/projects/bicycle-festival-01.jpg",
    ]);
    expect(projects.filter((project) => project.title === "Конференция")).toHaveLength(1);
    expect(projects.map((project) => project.title)).not.toContain("Выставочная площадка");
    expect(projects.map((project) => project.title)).not.toContain("Городское событие");
  });
});
