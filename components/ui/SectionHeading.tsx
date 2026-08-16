interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export default function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      {eyebrow && <p className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-[color:var(--muted)]">{eyebrow}</p>}
      <h2 className="text-[clamp(2.25rem,5vw,4.5rem)] font-black uppercase leading-[0.9] tracking-[-0.06em]">{title}</h2>
      {description && <p className="mt-5 text-lg leading-relaxed text-[color:var(--muted)]">{description}</p>}
    </div>
  );
}
