import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { advantages } from "@/data/advantages";

export default function Advantages() {
  return (
    <section aria-labelledby="advantages-heading" className="bg-[color:var(--foreground)] text-[color:var(--background)] [--muted:var(--muted-on-dark)]" id="advantages">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <Reveal>
          <div id="advantages-heading">
            <SectionHeading eyebrow="Спокойная организация" title="Почему мы" description="Берём на себя подбор, контроль и быструю реакцию, чтобы команда была готова к началу события." />
          </div>
        </Reveal>
        <p className="mt-6 text-sm font-black uppercase tracking-[0.12em] text-[color:var(--accent)]">Работаем с мероприятиями в Москве</p>
        <div className="mt-10 grid gap-px overflow-hidden border border-white/15 bg-white/15 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {advantages.map((advantage, index) => (
            <Reveal className="bg-[color:var(--foreground)]" delay={Math.min(index * 0.06, 0.24)} key={advantage.id}>
              <article className="min-h-56 p-6 sm:p-7">
                <span aria-hidden="true" className="text-sm font-black tracking-[0.12em] text-[color:var(--accent)]">0{index + 1}</span>
                <h3 className="mt-12 text-2xl font-black uppercase tracking-[-0.05em]">{advantage.title}</h3>
                <p className="mt-4 leading-relaxed text-white/65">{advantage.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
