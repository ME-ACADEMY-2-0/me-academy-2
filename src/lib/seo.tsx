import { siteUrl } from "@/lib/email/site";
import { MARY_ACADEMY_ROLE, MARY_CONSULT_ROLE } from "@/lib/site-content";

// Structured data (schema.org JSON-LD) for Google: what a page is about, so results can show prices, ratings, course
// details and breadcrumbs. https://developers.google.com/search/docs/appearance/structured-data

type Json = Record<string, unknown>;

export function JsonLd({ data }: { data: Json | Json[] }) {
  // "<" is escaped so text from courses or posts can never close the script tag early.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const abs = (path: string | null | undefined) => (!path ? undefined : path.startsWith("http") ? path : `${siteUrl()}${path}`);
const price = (minor: number) => (minor / 100).toFixed(2);
const plain = (html: string | null | undefined, max = 500) => (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, max) || undefined;
const rating = (value: number | null, count: number) =>
  value && count ? { "@type": "AggregateRating", ratingValue: value, reviewCount: count, bestRating: 5, worstRating: 1 } : undefined;

const academyId = () => `${siteUrl()}/#organization`;
const maryId = () => `${siteUrl()}/mary-ekemezie#person`;
const consultId = () => `${siteUrl()}/mary-ekemezie#me-consult`;

// The school's own details. `name` comes from Settings > Branding, `logo` and `email` when set. Mary Ekemezie is
// linked as its founder. ME Consult is a separate organisation and is never merged into this one.
export const organization = (o: { name: string; logo?: string | null; email?: string | null }): Json => ({
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": academyId(),
  name: o.name,
  url: siteUrl(),
  logo: abs(o.logo || "/icons/icon-512.png"),
  email: o.email || undefined,
  foundingDate: "2021",
  founder: { "@type": "Person", "@id": maryId(), name: "Mary Ekemezie", url: abs("/mary-ekemezie"), jobTitle: MARY_ACADEMY_ROLE },
});

// Mary Ekemezie and the two organisations she founded, kept as separate entities.
export function maryGraph(o: { description: string; image: string }): Json[] {
  const consultUrl = process.env.NEXT_PUBLIC_ME_CONSULT_URL || undefined;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": maryId(),
      name: "Mary Ekemezie",
      url: abs("/mary-ekemezie"),
      image: abs(o.image),
      description: o.description,
      jobTitle: [MARY_ACADEMY_ROLE, MARY_CONSULT_ROLE],
      worksFor: [{ "@id": academyId() }, { "@id": consultId() }],
      knowsAbout: ["Corporate law", "Commercial law", "M&A", "Private equity", "Corporate restructuring", "Corporate finance", "Employment law"],
    },
    { "@context": "https://schema.org", "@type": "Organization", "@id": consultId(), name: "ME Consult", url: consultUrl, founder: { "@id": maryId() } },
    { "@context": "https://schema.org", "@type": "EducationalOrganization", "@id": academyId(), founder: { "@id": maryId() } },
  ];
}

export function person(f: { slug: string; name: string; role: string; photo: string; bio: string; areas: string[] }): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": f.slug === "mary-ekemezie" ? maryId() : `${siteUrl()}/facilitators#${f.slug}`,
    name: f.name,
    jobTitle: f.role,
    image: abs(f.photo),
    description: f.bio,
    url: f.slug === "mary-ekemezie" ? abs("/mary-ekemezie") : abs(`/facilitators#${f.slug}`),
    knowsAbout: f.areas,
    affiliation: { "@id": academyId() },
  };
}

// Question and answer pairs for a FAQPage. Only pass answers that are visible on the page.
export const faqPage = (items: { q: string; a: string }[]): Json => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export const product = (p: { slug: string; name: string; summary: string | null; coverUrl: string | null; priceMinor: number | null; currency: string }): Json => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: p.name,
  description: p.summary ?? undefined,
  image: abs(p.coverUrl),
  url: abs(`/sme-hub/${p.slug}`),
  brand: { "@id": academyId() },
  // No price on file means no offer, so nothing unsupported is marked up.
  offers: p.priceMinor ? { "@type": "Offer", price: price(p.priceMinor), priceCurrency: p.currency, availability: "https://schema.org/InStock", url: abs(`/sme-hub/${p.slug}`) } : undefined,
});

export const website = (name: string): Json => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl()}/#website`,
  name,
  url: siteUrl(),
  publisher: { "@id": `${siteUrl()}/#organization` },
  potentialAction: { "@type": "SearchAction", target: `${siteUrl()}/courses?q={search_term_string}`, "query-input": "required name=search_term_string" },
});

export const breadcrumbs = (items: { name: string; path: string }[]): Json => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
});

export function course(c: {
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  coverUrl: string | null;
  level: string;
  priceMinor: number;
  currency: string;
  skills: string[];
  instructor: string;
  facilitators?: { name: string; role: string }[];
  nbaCpd?: string;
  seconds: number;
  rating: number | null;
  reviews: number;
}): Json {
  const url = abs(`/courses/${c.slug}`);
  const hours = Math.max(1, Math.round(c.seconds / 3600));
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: c.title,
    description: plain(c.summary) ?? plain(c.description) ?? `Learn ${c.title} online.`,
    url,
    image: abs(c.coverUrl),
    inLanguage: "en",
    educationalLevel: c.level,
    teaches: c.skills.length ? c.skills : undefined,
    provider: { "@id": academyId() },
    offers: {
      "@type": "Offer",
      category: c.priceMinor ? "Paid" : "Free",
      price: price(c.priceMinor),
      priceCurrency: c.currency,
      availability: "https://schema.org/InStock",
      url,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: `PT${hours}H`,
      instructor: c.facilitators?.length ? c.facilitators.map((f) => ({ "@type": "Person", name: f.name, jobTitle: f.role })) : { "@type": "Organization", name: c.instructor },
    },
    audience: { "@type": "Audience", audienceType: "Junior and mid-level lawyers, in-house counsel and lawyers who want practical training" },
    // Only courses listed on the NBA-ICLE page carry this.
    educationalCredentialAwarded: c.nbaCpd ? `${c.nbaCpd} (NBA-ICLE approved programme)` : undefined,
    aggregateRating: rating(c.rating, c.reviews),
  };
}

export function blogPosting(p: { slug: string; title: string; description: string | undefined; coverUrl: string | null; publishedAt: string | null; updatedAt: string | null; author: string | null }): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title.slice(0, 110),
    description: p.description,
    url: abs(`/insights/${p.slug}`),
    mainEntityOfPage: abs(`/insights/${p.slug}`),
    image: abs(p.coverUrl),
    datePublished: p.publishedAt ?? undefined,
    dateModified: p.updatedAt ?? p.publishedAt ?? undefined,
    author: p.author ? { "@type": "Person", name: p.author } : { "@id": `${siteUrl()}/#organization` },
    publisher: { "@id": `${siteUrl()}/#organization` },
  };
}
