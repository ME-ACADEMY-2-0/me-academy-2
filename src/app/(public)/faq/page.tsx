import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, faqPage } from "@/lib/seo";
import { Crumbs, FaqList, PageHero } from "@/components/market/Page";
import { SITE_FAQS } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about ME Academy, its courses and NBA-ICLE approved programmes, CPD points, certificates and the SME Hub.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className="mh pg">
      <JsonLd data={faqPage(SITE_FAQS.flatMap((g) => g.items))} />
      <Crumbs items={[{ name: "FAQ", path: "/faq" }]} />
      <PageHero eyebrow="FAQ" title="Frequently asked questions" lead="Straight answers about ME Academy, its courses and programmes, CPD points and the SME Hub." />
      {SITE_FAQS.map((g) => (
        <FaqList key={g.group} items={g.items} title={g.group} schema={false} />
      ))}
      <section className="pg-callout">
        <div>
          <h2>Still have a question?</h2>
          <p>Send us a message and we will reply, usually within one working day.</p>
        </div>
        <Link href="/contact" className="mh-btn mh-btn-ink">
          Contact us
        </Link>
      </section>
    </div>
  );
}
