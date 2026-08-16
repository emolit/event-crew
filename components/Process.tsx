import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { processSteps } from "@/data/process";

export default function Process() {
  return (
    <section aria-labelledby="process-heading" className="border-y border-black/10 bg-white/35">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <Reveal>
          <div id="process-heading">
            <SectionHeading eyebrow="От заявки до площадки" title="Как мы работаем" description="Понятный процесс помогает заранее согласовать роли, время и детали без лишней суеты." />
          </div>
        </Reveal>
        <ol className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-4 lg:gap-0">
          {processSteps.map((step, index) => (
            <li className="relative lg:border-l lg:border-black/15 lg:pl-6 first:lg:border-l-0 first:lg:pl-0" key={step.number}>
              <Reveal delay={Math.min(index * 0.08, 0.24)}>
                <article aria-label={`${step.number} ${step.title}`} className="min-h-44 border border-black/10 bg-[color:var(--background)] p-6 lg:min-h-64 lg:border-0 lg:bg-transparent lg:p-0">
                  <span className="text-4xl font-black tracking-[-0.06em] text-[color:var(--accent)]">{step.number}</span>
                  <h3 className="mt-10 text-2xl font-black uppercase tracking-[-0.05em]">{step.title}</h3>
                  <p className="mt-4 leading-relaxed text-[color:var(--muted)]">{step.description}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
