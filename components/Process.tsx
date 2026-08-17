import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { processSteps } from "@/data/process";

export default function Process() {
  return (
    <section aria-labelledby="process-heading" className="border-y border-black/10 bg-white/35" id="process">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-24 sm:py-32">
        <Reveal>
          <div id="process-heading">
            <SectionHeading eyebrow="Тайминг заказа" title="От брифа до выхода" description="На каждом этапе вы понимаете, какой результат получите и что нужно согласовать." />
          </div>
        </Reveal>
        <ol className="relative mt-12 grid gap-0 border-l-2 border-[color:var(--accent)] pl-6 lg:mt-16 lg:grid-cols-4 lg:border-l-0 lg:border-t-2 lg:pl-0">
          {processSteps.map((step, index) => (
            <li className="relative border-b border-black/15 py-7 last:border-b-0 lg:border-b-0 lg:border-r lg:px-6 lg:py-8 first:lg:pl-0 last:lg:border-r-0 last:lg:pr-0" key={step.number}>
              <Reveal delay={Math.min(index * 0.08, 0.24)}>
                <article aria-label={`${step.number} ${step.title}`} className="min-h-40">
                  <span className="text-sm font-black tabular-nums tracking-[0.12em] text-[color:var(--muted)]" data-timeline-marker>{step.number}</span>
                  <h3 className="mt-8 text-2xl font-black leading-none tracking-[-0.035em]">{step.title}</h3>
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
