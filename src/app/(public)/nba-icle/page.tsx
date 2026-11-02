import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarDays, PlayCircle } from "lucide-react";
import { JsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/email/site";
import { Crumbs, FaqList, PageHero, Section } from "@/components/market/Page";
import { NBA_AUDIENCE, NBA_FAQS, PROGRAMMES, TOPICS } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "NBA-ICLE Approved Legal Training",
  description: "NBA-ICLE approved CPD programmes from ME Academy: live cohorts and recordings of past approved courses in corporate-commercial and transactional law.",
  alternates: { canonical: "/nba-icle" },
};

export default function NbaIclePage() {
  const live = PROGRAMMES.filter((p) => p.kind === "live");
  const recordings = PROGRAMMES.filter((p) => p.kind === "recording");
  return (
    <div className="mh pg">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "NBA-ICLE approved programmes at ME Academy",
          itemListElement: PROGRAMMES.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: `${siteUrl()}/nba-icle/${p.slug}` })),
        }}
      />
      <Crumbs items={[{ name: "NBA-ICLE", path: "/nba-icle" }]} />
      <PageHero
        eyebrow="NBA-ICLE approved CPD"
        title="NBA-ICLE Approved Legal Training at ME Academy"
        lead="Practical, structured legal training for lawyers building commercial and transactional capability, delivered as live cohorts and on-demand recordings. NBA-ICLE has approved ME Academy as an accredited service provider."
      >
        <div className="mh-ctas">
          <a href="#programmes" className="mh-btn mh-btn-amber">
            See the programmes <ArrowRight size={16} />
          </a>
          <Link href="/contact" className="mh-btn mh-btn-line">
            Ask about the next cohort
          </Link>
        </div>
      </PageHero>

      <Section title="Two ways to earn approved training" eyebrow="Pathways">
        <div className="pg-two">
          <article className="pg-card">
            <span className="pg-icon">
              <CalendarDays size={20} />
            </span>
            <h3>Pathway one: live programmes</h3>
            <p>Cohort-based programmes with live expert facilitation, case-based learning, NBA-ICLE approved content and real-time Q&amp;A.</p>
          </article>
          <article className="pg-card">
            <span className="pg-icon">
              <PlayCircle size={20} />
            </span>
            <h3>Pathway two: past approved courses</h3>
            <p>Recordings of previous NBA-ICLE approved courses. Self-paced, with video and slides, so you can learn on your own schedule.</p>
          </article>
        </div>
      </Section>

      <Section title="Why approval matters" eyebrow="Recognition">
        <div className="pg-prose">
          <p>NBA-ICLE approval means the training is recognised within the continuing legal education framework. You get practice-ready skills and training that counts towards your CPD.</p>
        </div>
        <ul className="pg-tags is-lg">
          {NBA_AUDIENCE.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Section>

      <Section title="Live programmes" eyebrow="Pathway one" id="programmes">
        <ProgrammeGrid items={live} />
        <p className="pg-note">Dates are announced as each cohort opens. <Link href="/contact">Contact us</Link> to be told when the next one starts.</p>
      </Section>

      <Section title="Recorded NBA-ICLE courses" eyebrow="Pathway two">
        <ProgrammeGrid items={recordings} />
      </Section>

      <Section title="Explore by practice area" eyebrow="Legal training">
        <ul className="pg-tags is-lg">
          {TOPICS.map((t) => (
            <li key={t.slug}>
              <Link href={`/legal-training/${t.slug}`}>{t.title}</Link>
            </li>
          ))}
        </ul>
      </Section>

      <FaqList items={NBA_FAQS} />
    </div>
  );
}

function ProgrammeGrid({ items }: { items: typeof PROGRAMMES }) {
  return (
    <div className="pg-progs">
      {items.map((p) => (
        <Link key={p.slug} href={`/nba-icle/${p.slug}`} className="pg-prog">
          <span className="pg-badge">
            <BadgeCheck size={14} /> NBA-ICLE approved{p.cpd ? `, ${p.cpd}` : ""}
          </span>
          <b>{p.title}</b>
          <small>{p.summary}</small>
          <span className="pg-prog-foot">
            {p.format}
            <ArrowUpRight size={15} aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  );
}
