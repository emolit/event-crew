import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { projects, type ProjectSize } from "@/data/projects";

const secondarySlideGroup = new Set(["project-02", "project-04", "project-06"]);

const sizeClasses: Record<ProjectSize, string> = {
  standard: "lg:col-span-1",
  wide: "lg:col-span-2",
  tall: "lg:col-span-1 lg:row-span-2",
};

const imageSizes: Record<ProjectSize, string> = {
  standard: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  wide: "(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw",
  tall: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
};

export default function Projects() {
  return (
    <section aria-labelledby="projects-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12" id="projects">
      <Reveal>
        <div id="projects-heading">
          <SectionHeading title="Проекты" description="Представляем малую часть проектов, которые стали возможны благодаря работе нашей команды." />
        </div>
      </Reveal>
      <div className="mt-10 grid auto-rows-[17rem] gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:auto-rows-[16rem]">
        {projects.map((project, index) => (
          <Reveal className={sizeClasses[project.size]} delay={Math.min(index * 0.05, 0.25)} key={project.id}>
            <ProjectCard
              autoSlideOffset={secondarySlideGroup.has(project.id) ? 2500 : 0}
              imageSizes={imageSizes[project.size]}
              project={project}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
