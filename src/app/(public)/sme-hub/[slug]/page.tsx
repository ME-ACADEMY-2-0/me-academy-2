import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { getSmeProduct, getSmeProducts } from "@/lib/data/sme";
import { SmePrice, SmeProductGrid } from "@/components/market/SmeProductCard";
import { JsonLd, product as seoProduct } from "@/lib/seo";
import { Crumbs, FaqList, PageHero } from "@/components/market/Page";
import { SME_SECTIONS, smeSectionBySlug } from "@/lib/site-content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SME_SECTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const section = smeSectionBySlug(slug);
  if (section) return { title: section.h1, description: section.intro, alternates: { canonical: `/sme-hub/${slug}` } };
  await connection();
  const p = await getSmeProduct(slug);
  return p ? { title: p.name, description: p.summary ?? undefined, alternates: { canonical: `/sme-hub/${p.slug}` } } : { title: "Not found" };
}

// A section such as /sme-hub/hr-policies, or a single template. The slug is only known per request, so it is read
// inside Suspense.
export default function SmeProductPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="et-skel" style={{ height: 420 }} />}>
      <Page params={params} />
    </Suspense>
  );
}

async function Page({ params }: Props) {
  const slug = (await params).slug;
  const section = smeSectionBySlug(slug);
  if (section) {
    return (
      <div className="mh pg">
        <Crumbs
          items={[
            { name: "SME Hub", path: "/sme-hub" },
            { name: section.title, path: `/sme-hub/${section.slug}` },
          ]}
        />
        <PageHero eyebrow="SME Hub" title={section.h1} lead={section.intro} />
        <Suspense fallback={<div className="et-skel" style={{ height: 360 }} />}>
          <SectionProducts slug={section.slug} />
        </Suspense>
        <FaqList items={section.faqs} />
      </div>
    );
  }
  return (
    <div className="et-mkt">
      <Product params={params} />
    </div>
  );
}

async function SectionProducts({ slug }: { slug: string }) {
  await connection();
  const section = smeSectionBySlug(slug)!;
  const products = (await getSmeProducts()).filter((p) => section.match(p));
  return products.length ? <SmeProductGrid products={products} /> : <p className="et-empty">Nothing here yet.</p>;
}

async function Product({ params }: Props) {
  await connection();
  const p = await getSmeProduct((await params).slug);
  if (!p) notFound();
  return (
    <>
      <JsonLd data={seoProduct(p)} />
      <Crumbs
        items={[
          { name: "SME Hub", path: "/sme-hub" },
          { name: p.name, path: `/sme-hub/${p.slug}` },
        ]}
      />
      <Link href="/sme-hub" className="et-pp-back">
        <ArrowLeft size={15} /> SME Hub
      </Link>
      <section className="et-sme-detail">
        <span className="et-sme-cover is-large">{p.coverUrl ? <img src={p.coverUrl} alt={p.name} /> : <FileText size={56} aria-hidden="true" />}</span>
        <div>
          <small className="et-sme-kicker">{p.category}</small>
          <h1>{p.name}</h1>
          {p.summary && <p className="et-muted">{p.summary}</p>}
          <p className="et-sme-detail-price">
            <SmePrice p={p} />
          </p>
          <div className="et-home-ctas" style={{ justifyContent: "flex-start" }}>
            <Link href="/contact" className="et-btn et-btn-primary et-home-btn">
              Enquire about this {p.kind === "subscription" ? "subscription" : p.kind} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
