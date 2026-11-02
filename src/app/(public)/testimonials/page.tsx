import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Testimonials } from "@/components/market/Testimonials";
import { Crumbs, PageHero } from "@/components/market/Page";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "What lawyers say about learning at ME Academy.",
  alternates: { canonical: "/testimonials" },
};

export default function TestimonialsPage() {
  return (
    <div className="mh pg">
      <Crumbs items={[{ name: "Testimonials", path: "/testimonials" }]} />
      <PageHero eyebrow="Testimonials" title="What participants say about ME Academy" lead="Feedback from lawyers who have taken our courses and programmes." />
      <Testimonials />
      <section className="pg-callout">
        <div>
          <h2>Learn from the people who do the deals</h2>
          <p>Browse the courses and NBA-ICLE approved programmes.</p>
        </div>
        <Link href="/courses" className="mh-btn mh-btn-ink">
          Browse courses <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
