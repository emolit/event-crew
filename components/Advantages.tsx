import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { advantages } from "@/data/advantages";

export default function Advantages() {
  return (
    <section aria-labelledby="advantages-heading" className="bg-[color:var(--foreground)] text-[color:var(--background)] [--muted:var(--muted-on-dark)]" id="advantages">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-24 sm:py-32">
        <Reveal>
          <div id="advantages-heading">
            <SectionHeading eyebrow="Контроль площадки" title="Что держим под контролем" description="До события вы получаете согласованный состав. В день смены координатор следит за выходом команды." />
          </div>
        </Reveal>
        <p className="mt-6 text-sm font-black uppercase tracking-[0.12em] text-[color:var(--accent)]">Работаем с мероприятиями в Москве</p>
        <ul aria-label="Контроль выхода команды" className="mt-12 border-t border-white/20 lg:mt-16">
          {advantages.map((advantage, index) => (
            <li className="border-b border-white/20" key={advantage.id}>
              <Reveal>
                <article className="grid gap-4 py-7 md:grid-cols-[4rem_minmax(14rem,0.85fr)_minmax(0,1.15fr)] md:items-start">
                  <span aria-hidden="true" className="text-xs font-bold tracking-[0.14em] text-[color:var(--accent)]">CHECK {index + 1}</span>
                  <h3 className="text-2xl font-black leading-none tracking-[-0.03em]">{advantage.title}</h3>
                  <p className="max-w-xl leading-relaxed text-white/70">{advantage.description}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
