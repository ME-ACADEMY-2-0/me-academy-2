import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd, maryGraph } from "@/lib/seo";
import { Crumbs, PageHero, Section } from "@/components/market/Page";
import { MARY_ACADEMY_ROLE, MARY_CONSULT_ROLE, MARY_CREDENTIALS, facilitatorBySlug } from "@/lib/site-content";

/* eslint-disable @next/next/no-img-element */

const mary = facilitatorBySlug("mary-ekemezie")!;
const DESCRIPTION = `Mary Ekemezie is ${MARY_CONSULT_ROLE} and ${MARY_ACADEMY_ROLE}. A corporate and investment lawyer with more than 18 years of experience.`;

export const metadata: Metadata = {
  title: "Mary Ekemezie",
  description: DESCRIPTION,
  alternates: { canonical: "/mary-ekemezie" },
};

// The one page where both of Mary's roles appear together. Everywhere else on the site she is
// "Founder & Lead Facilitator, ME Academy".
export default function MaryPage() {
  const consultUrl = process.env.NEXT_PUBLIC_ME_CONSULT_URL;
  return (
    <div className="mh pg">
      <JsonLd data={maryGraph({ description: DESCRIPTION, image: mary.photo })} />
      <Crumbs items={[{ name: "Mary Ekemezie", path: "/mary-ekemezie" }]} />
      <section className="pg-profile">
        <img src={mary.photo} alt="Mary Ekemezie" />
        <div>
          <span className="mh-eyebrow">Corporate and investment lawyer</span>
          <h1>Mary Ekemezie</h1>
          <ul className="pg-roles">
            <li>
              <b>{MARY_CONSULT_ROLE}</b>
            </li>
            <li>
              <b>{MARY_ACADEMY_ROLE}</b>
            </li>
          </ul>
          <p>
            Mary Ekemezie has more than 18 years of experience in M&amp;A, private equity, corporate restructuring, corporate finance, general corporate advisory and employment law.
          </p>
          <div className="mh-ctas">
            <Link href="/legal-training" className="mh-btn mh-btn-ink">
              Explore ME Academy training <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Section title="Two roles, two organisations" eyebrow="ME Academy and ME Consult">
        <div className="pg-two">
          <article className="pg-card">
            <h3>{MARY_ACADEMY_ROLE}</h3>
            <p>Mary founded ME Academy in 2021 and leads its training in corporate-commercial and transactional law. ME Academy teaches practical skills through courses and NBA-ICLE approved programmes, and publishes the SME Hub for startups and small businesses.</p>
            <Link href="/about" className="mh-link">
              About ME Academy <ArrowRight size={14} />
            </Link>
          </article>
          <article className="pg-card">
            <h3>{MARY_CONSULT_ROLE}</h3>
            <p>ME Consult is a legal advisory practice. It is a separate organisation from ME Academy, and ME Academy is an independent platform. Legal advice for your own matter comes from ME Consult, not from ME Academy courses or SME Hub templates.</p>
            {consultUrl ? (
              <a href={consultUrl} className="mh-link" rel="noopener">
                Visit ME Consult <ArrowRight size={14} />
              </a>
            ) : null}
          </article>
        </div>
      </Section>

      <Section title="Selected work and recognition" eyebrow="Track record">
        <ul className="pg-list">
          {MARY_CREDENTIALS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Section>

      <Section title="Where she teaches" eyebrow="At ME Academy">
        <div className="pg-links">
          <Link href="/courses" className="pg-link">
            <b>Courses</b>
            <small>Practical corporate-commercial and transactional training</small>
          </Link>
          <Link href="/nba-icle" className="pg-link">
            <b>NBA-ICLE approved programmes</b>
            <small>Live programmes and recordings that carry CPD points</small>
          </Link>
          <Link href="/facilitators" className="pg-link">
            <b>Facilitators</b>
            <small>The practitioners who teach alongside her</small>
          </Link>
        </div>
      </Section>
    </div>
  );
}
