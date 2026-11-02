import { TESTIMONIALS } from "@/lib/testimonials";

const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export function Testimonials({ limit }: { limit?: number }) {
  const items = limit ? TESTIMONIALS.slice(0, limit) : TESTIMONIALS;
  return (
    <div className="et-testi">
      {items.map((t) => (
        <figure key={t.name + t.course} className="et-card et-testi-card">
          <blockquote>{t.quote}</blockquote>
          <figcaption>
            <span className="et-testi-av">{initials(t.name)}</span>
            <span>
              <b>{t.name}</b>
              <small>{t.course}</small>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
