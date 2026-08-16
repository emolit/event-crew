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
    expect(projects).toHaveLength(6);
    expect(processSteps.map((step) => step.number)).toEqual(["01", "02", "03", "04"]);
    expect(siteConfig.brand).toBe("EVENT CREW");
  });

  it("keeps all content images local and replaceable", () => {
    const paths = [siteConfig.heroImage, ...services.map((service) => service.image), ...projects.map((project) => project.image)];
    expect(paths.every((path) => path.startsWith("/images/"))).toBe(true);
  });
});
