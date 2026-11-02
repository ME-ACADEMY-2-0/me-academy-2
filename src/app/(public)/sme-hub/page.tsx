import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Search } from "lucide-react";
import { getSmeProducts, SME_CATEGORIES } from "@/lib/data/sme";
import { SmeProductGrid } from "@/components/market/SmeProductCard";

export const metadata: Metadata = {
  title: "SME Hub",
  description: "Your legal lifeline for startups and small businesses in Nigeria.",
  alternates: { canonical: "/sme-hub" },
};

type Props = { searchParams: Promise<{ q?: string; category?: string }> };

// Legal templates, bundles and subscriptions, filtered by category (?category=) and search (?q=).
export default function SmeHubPage({ searchParams }: Props) {
  return (
    <div className="et-mkt">
      <section className="et-mkt-hero is-tight">
        <span className="et-home-pill">SME Hub</span>
        <h1>Your legal lifeline for startups and small businesses in Nigeria.</h1>
        <p>Practical legal templates, bundles and resources for founders, from investment agreements to HR policies and company resolutions.</p>
        <form action="/sme-hub" role="search" className="et-public-search" style={{ maxWidth: 520, width: "100%" }}>
          <Search size={16} aria-hidden="true" />
          <input type="search" name="q" placeholder="Search templates" aria-label="Search templates" />
        </form>
      </section>
      <Suspense fallback={<div className="et-skel" style={{ height: 520 }} />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: Props) {
  await connection();
  const { q = "", category = "" } = await searchParams;
  const needle = q.trim().toLowerCase().slice(0, 80);
  const all = await getSmeProducts();
  const products = all.filter((p) => (!category || p.category === category) && (!needle || [p.name, p.category, p.summary].some((t) => t?.toLowerCase().includes(needle))));
  const href = (c: string) => `/sme-hub?${new URLSearchParams({ ...(needle ? { q: needle } : {}), ...(c ? { category: c } : {}) })}`;
  return (
    <>
      <nav className="et-seg et-sme-cats" aria-label="Category">
        {["", ...SME_CATEGORIES].map((c) => (
          <a key={c || "all"} href={href(c)} className={category === c ? "is-on" : ""}>
            {c || "All"}
          </a>
        ))}
      </nav>
      {products.length ? <SmeProductGrid products={products} /> : <p className="et-empty">{needle ? `No templates match "${q}".` : "Nothing here yet."}</p>}
    </>
  );
}
