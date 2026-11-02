import type { Metadata } from "next";
import { JsonLd, person } from "@/lib/seo";
import { Crumbs, PageHero } from "@/components/market/Page";
import { FACILITATORS } from "@/lib/site-content";
import Link from "next/link";

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: "Facilitators",
  description: "The practising lawyers who teach at ME Academy, led by Mary Ekemezie, Founder & Lead Facilitator, ME Academy.",
  alternates: { canonical: "/facilitators" },
};

export default function FacilitatorsPage() {
  return (
    <div className="mh pg">
      <JsonLd data={FACILITATORS.map(person)} />
      <Crumbs items={[{ name: "Facilitators", path: "/facilitators" }]} />
      <PageHero
        eyebrow="Facilitators"
        title="Learn from lawyers who do this work every day"
        lead="ME Academy's facilitators are experienced legal practitioners and industry experts. Each one teaches from live transactions."
      />
      <div className="pg-people">
        {FACILITATORS.map((f) => (
          <article key={f.slug} id={f.slug} className="pg-person">
            <img src={f.photo} alt={f.name} loading="lazy" />
            <div>
              <h2>{f.slug === "mary-ekemezie" ? <Link href="/mary-ekemezie">{f.name}</Link> : f.name}</h2>
              <small>{f.role}</small>
              <p>{f.bio}</p>
              <ul className="pg-tags">
                {f.areas.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
