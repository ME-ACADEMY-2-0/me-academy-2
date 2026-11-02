import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Crumbs, FaqList, PageHero } from "@/components/market/Page";
import { SITE_FAQS, TOPICS } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Legal training in Nigeria: corporate, commercial and transactional law",
  description: "Practical corporate-commercial and transactional legal training for Nigerian lawyers, from contract drafting and due diligence to banking, project finance and M&A.",
  alternates: { canonical: "/legal-training" },
};

export default function LegalTrainingPage() {
  return (
    <div className="mh pg">
      <Crumbs items={[{ name: "Legal training", path: "/legal-training" }]} />
      <PageHero
        eyebrow="Legal training"
        title="Practical corporate-commercial and transactional legal education"
        lead="ME Academy bridges the gap between formal legal education and practice. Pick a practice area to see what is taught, who teaches it and which courses cover it."
      >
        <div className="mh-ctas">
          <Link href="/courses" className="mh-btn mh-btn-amber">
            Browse all courses
          </Link>
          <Link href="/nba-icle" className="mh-btn mh-btn-line">
            NBA-ICLE approved programmes
          </Link>
        </div>
      </PageHero>
      <div className="pg-topics">
        {TOPICS.map((t) => (
          <Link key={t.slug} href={`/legal-training/${t.slug}`} className="pg-topic">
            <b>{t.title}</b>
            <small>{t.summary}</small>
            <span aria-hidden="true">
              <ArrowUpRight size={15} />
            </span>
          </Link>
        ))}
      </div>
      <FaqList items={SITE_FAQS[0].items} title="About ME Academy" />
    </div>
  );
}
