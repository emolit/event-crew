import Image from "next/image";
import { services } from "@/data/services";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Services() {
  return (
    <section aria-labelledby="services-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12" id="services">
      <Reveal>
        <div id="services-heading">
          <SectionHeading eyebrow="Команда под задачу" title="Услуги" description="Подбираем персонал, который уверенно работает с гостями, сценарием и темпом вашего события." />
        </div>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
        {services.map((service, index) => (
          <Reveal delay={Math.min(index * 0.04, 0.28)} key={service.id}>
            <article className="group h-full overflow-hidden border border-black/10 bg-white/40">
              <div className="aspect-[4/3] overflow-hidden bg-black/5">
                <Image alt={service.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" height={675} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" src={service.image} width={900} />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-black uppercase tracking-[-0.04em]">{service.name}</h3>
                <p className="mt-3 leading-relaxed text-[color:var(--muted)]">{service.description}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
