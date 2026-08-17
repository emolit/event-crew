interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export default function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="grid max-w-5xl gap-5 md:grid-cols-[minmax(12rem,0.8fr)_minmax(0,2fr)]">
      {eyebrow && <p className="pt-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--muted)]">{eyebrow}</p>}
      <div className="crew-line pl-5">
        <h2 className="text-[clamp(2.75rem,6vw,5.75rem)] font-black leading-[0.86] tracking-[-0.045em]">{title}</h2>
        {description && <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--muted)] sm:text-lg">{description}</p>}
      </div>
    </div>
  );
}
