import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Crumbs, PageHero, Section } from "@/components/market/Page";
import { Testimonials } from "@/components/market/Testimonials";

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: "Alumni",
  description: "ME Academy alumni: lawyers and teams who have learned with us, and how to verify a certificate.",
  alternates: { canonical: "/alumni" },
};

export default function AlumniPage() {
  return (
    <div className="mh pg">
      <Crumbs items={[{ name: "Alumni", path: "/alumni" }]} />
      <PageHero eyebrow="Alumni" title="Lawyers and teams who have learned with ME Academy" lead="Every learner who finishes a course earns a certificate with an ID that anyone can check." />
      <Section title="Organisations whose teams have learned with us" eyebrow="Where alumni work">
        <div className="pg-orgs">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i}>
              <img src={`/content/orgs/org-${i}.png`} alt="" loading="lazy" />
            </span>
          ))}
        </div>
      </Section>
      <Section title="In their words" eyebrow="Alumni feedback">
        <Testimonials limit={6} />
      </Section>
      <section className="pg-callout">
        <div>
          <h2>Verify a certificate</h2>
          <p>Employers and colleagues can confirm a certificate with its ID.</p>
        </div>
        <Link href="/certificate" className="mh-btn mh-btn-ink">
          Verify a certificate <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
