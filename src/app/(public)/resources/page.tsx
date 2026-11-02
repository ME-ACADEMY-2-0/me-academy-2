import type { Metadata } from "next";
import { Crumbs, LinkCards, PageHero, Section } from "@/components/market/Page";
import { SME_SECTIONS } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Resources",
  description: "Guides, templates, FAQs and help from ME Academy for lawyers, founders and small businesses.",
  alternates: { canonical: "/resources" },
};

export default function ResourcesPage() {
  return (
    <div className="mh pg">
      <Crumbs items={[{ name: "Resources", path: "/resources" }]} />
      <PageHero eyebrow="Resources" title="Resources for lawyers, founders and small businesses" lead="Everything ME Academy publishes beyond the courses, in one place." />
      <Section title="For lawyers" eyebrow="Learn">
        <LinkCards
          items={[
            { href: "/legal-training", title: "Legal training", body: "Practice areas, what is taught and which courses cover them." },
            { href: "/nba-icle", title: "NBA-ICLE approved programmes", body: "Live cohorts and recordings that carry CPD points." },
            { href: "/insights", title: "Insights", body: "Guides and articles on corporate-commercial practice." },
            { href: "/faq", title: "FAQ", body: "Answers about courses, CPD points and certificates." },
          ]}
        />
      </Section>
      <Section title="For founders and small businesses" eyebrow="SME Hub">
        <LinkCards items={SME_SECTIONS.map((s) => ({ href: `/sme-hub/${s.slug}`, title: s.title, body: s.intro }))} />
      </Section>
      <Section title="Help" eyebrow="Support">
        <LinkCards
          items={[
            { href: "/help", title: "Help centre", body: "Payments, downloads, certificates and your account." },
            { href: "/certificate", title: "Verify a certificate", body: "Check a certificate with its ID." },
            { href: "/contact", title: "Contact us", body: "Send the team a message." },
          ]}
        />
      </Section>
    </div>
  );
}
