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
    expect(services.map((service) => service.price)).toEqual([700, 750, 850, 650, 850, 550, 700, 700]);
    expect(services.map((service) => service.image)).toEqual([
      "/images/services/service-helpers.webp",
      "/images/services/service-promoters.webp",
      "/images/services/service-hostess.webp",
      "/images/services/service-waiters.webp",
      "/images/services/service-coordinators.webp",
      "/images/services/service-cloakroom.webp",
      "/images/services/service-security.jpg",
      "/images/services/service-riggers.jpg",
    ]);
  });

  it("replaces the exhibition with one gala dinner while keeping stable image paths", () => {
    expect(projects.map((project) => project.id)).toEqual([
      "project-01",
      "project-02",
      "project-06",
      "project-04",
      "project-05",
    ]);
    expect(projects.map((project) => project.image)).toEqual([
      "/images/projects/project-01.webp",
      "/images/projects/project-02.webp",
      "/images/projects/project-06.webp",
      "/images/projects/project-04.webp",
      "/images/projects/project-05.webp",
    ]);
    expect(projects.filter((project) => project.title === "Вечерний гала-ужин")).toHaveLength(1);
    expect(projects.map((project) => project.title)).not.toContain("Выставочная площадка");
  });
});
