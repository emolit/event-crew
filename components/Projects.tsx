import Image from "next/image";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { projects, type ProjectSize } from "@/data/projects";

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
    <section aria-labelledby="projects-heading" className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-24 sm:py-32" id="projects">
      <Reveal>
        <div id="projects-heading">
          <SectionHeading eyebrow="Полевые записи" title="Команды на площадке" description="Размер и роли меняются вместе со сценарием. В каждом проекте показываем, кто отвечал за работу с гостями." />
        </div>
      </Reveal>
      <div className="mt-12 grid auto-rows-[28rem] gap-x-5 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:auto-rows-[30rem]">
        {projects.map((project, index) => (
          <Reveal className={sizeClasses[project.size]} delay={Math.min(index * 0.05, 0.25)} key={project.id}>
            <article aria-label={project.title} className="group grid h-full grid-rows-[minmax(0,1fr)_auto] border-t border-black/20 pt-3">
              <div className="min-h-0 overflow-hidden bg-black">
                <Image alt={project.alt} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.015]" height={900} sizes={imageSizes[project.size]} src={project.image} width={1200} />
              </div>
              <div className="grid gap-2 border-b border-black/15 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end" data-testid="project-caption">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[color:var(--muted)]">{project.type}</p>
                  <h3 className="mt-2 text-2xl font-black leading-none tracking-[-0.035em]">{project.title}</h3>
                </div>
                <p className="flex flex-wrap gap-x-2 text-xs font-bold uppercase leading-relaxed tracking-[0.08em] text-[color:var(--muted)]">
                  {project.roles.map((role, roleIndex) => (
                    <span key={role}>
                      {roleIndex > 0 && <span aria-hidden="true"> · </span>}
                      {role}
                    </span>
                  ))}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
