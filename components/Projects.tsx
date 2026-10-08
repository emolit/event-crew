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
    <section aria-labelledby="projects-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12" id="projects">
      <Reveal>
        <div id="projects-heading">
          <SectionHeading eyebrow="На площадке" title="Проекты" description="Каждый состав команды зависит от сценария, пространства и того, как гости двигаются по событию." />
        </div>
      </Reveal>
      <div className="mt-10 grid auto-rows-[17rem] gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:auto-rows-[16rem]">
        {projects.map((project, index) => (
          <Reveal className={sizeClasses[project.size]} delay={Math.min(index * 0.05, 0.25)} key={project.id}>
            <article aria-label={project.title} className="group relative h-full overflow-hidden bg-black text-white">
              <Image alt={project.alt} className="h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-[1.04]" height={900} sizes={imageSizes[project.size]} src={project.image} width={1200} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5 pt-20 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--accent)]">{project.type}</p>
                <h3 className="mt-2 text-2xl font-black uppercase tracking-[-0.05em]">{project.title}</h3>
                <p className="mt-3 flex flex-wrap gap-x-2 text-sm leading-relaxed text-white/70">
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
