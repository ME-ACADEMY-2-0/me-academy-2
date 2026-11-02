import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowRight, BadgeCheck, Check } from "lucide-react";
import { getCatalog } from "@/lib/data/learn";
import { getPublicBlog } from "@/lib/data/blog";
import { formatPrice } from "@/lib/format";
import { JsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/email/site";
import { PublicCourseGrid } from "@/components/market/PublicCourseGrid";
import { Crumbs, FacilitatorCard, FaqList, PageHero, Section } from "@/components/market/Page";
import { APPROVAL_STATUS, COURSE_FACILITATORS, NBA_AUDIENCE, PROGRAMMES, courseFaqs, facilitatorBySlug, programmeBySlug, type Programme } from "@/lib/site-content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PROGRAMMES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = programmeBySlug((await params).slug);
  if (!p) return { title: "Not found" };
  return { title: `${p.title} (NBA-ICLE approved)`, description: p.summary, alternates: { canonical: `/nba-icle/${p.slug}` } };
}

export default async function ProgrammePage({ params }: Props) {
  const p = programmeBySlug((await params).slug);
  if (!p) notFound();
  const facIds = p.facilitators ?? (p.courseSlug ? COURSE_FACILITATORS[p.courseSlug] : undefined) ?? [];
  const facs = facIds.map(facilitatorBySlug).filter((f): f is NonNullable<typeof f> => !!f);
  return (
    <div className="mh pg">
      <Crumbs
        items={[
          { name: "NBA-ICLE", path: "/nba-icle" },
          { name: p.title, path: `/nba-icle/${p.slug}` },
        ]}
      />
      <PageHero eyebrow="NBA-ICLE approved programme" title={p.title} lead={p.summary} />
      <Suspense fallback={<div className="et-skel" style={{ height: 360 }} />}>
        <Body p={p} facs={facs} />
      </Suspense>
    </div>
  );
}

async function Body({ p, facs }: { p: Programme; facs: NonNullable<ReturnType<typeof facilitatorBySlug>>[] }) {
  await connection();
  const [catalog, blog] = await Promise.all([getCatalog(60), getPublicBlog()]);
  const course = p.courseSlug ? catalog.find((c) => c.slug === p.courseSlug) : undefined;
  const related = catalog.filter((c) => course && c.id !== course.id && c.category && c.category === course.category).slice(0, 4);
  const words = p.title.toLowerCase().split(/\W+/).filter((w) => w.length > 5);
  const articles = blog.posts.filter((a) => words.some((w) => a.title.toLowerCase().includes(w))).slice(0, 3);
  const facts: [string, string][] = [
    ["Approval status", APPROVAL_STATUS],
    ...(p.cpd ? ([["CPD points", p.cpd]] as [string, string][]) : []),
    ["Format", p.format],
    ...(p.kind === "live" ? ([["Date", "To be announced"]] as [string, string][]) : ([["Recording", "Available, watch at your own pace"]] as [string, string][])),
    ...(course ? ([["Price", formatPrice(course.priceMinor, course.currency)]] as [string, string][]) : []),
  ];
  const faqs = courseFaqs({ title: p.title, summary: p.summary, level: course?.level ?? "intermediate", skills: p.skills ?? [], category: course?.category ?? null, facilitators: facs.map((f) => f.name), nba: p });
  const url = `${siteUrl()}/nba-icle/${p.slug}`;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: p.title,
          description: p.summary,
          url,
          provider: { "@id": `${siteUrl()}/#organization` },
          audience: { "@type": "Audience", audienceType: NBA_AUDIENCE.join(", ") },
          teaches: p.skills,
          educationalCredentialAwarded: p.cpd ? `${p.cpd} (NBA-ICLE approved programme)` : undefined,
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: p.kind === "recording" ? "Online" : undefined,
            instructor: facs.length ? facs.map((f) => ({ "@type": "Person", name: f.name, jobTitle: f.role })) : undefined,
          },
          offers: course ? { "@type": "Offer", price: (course.priceMinor / 100).toFixed(2), priceCurrency: course.currency, availability: "https://schema.org/InStock", url } : undefined,
        }}
      />
      <section className="pg-split">
        <dl className="pg-facts">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{k === "Approval status" ? <span className="pg-badge"><BadgeCheck size={14} /> {v}</span> : v}</dd>
            </div>
          ))}
        </dl>
        <div className="pg-reg">
          <h2>Registration</h2>
          {course ? (
            <>
              <p>Register for the recording and start watching straight away.</p>
              <Link href={`/courses/${course.slug}`} className="mh-btn mh-btn-ink">
                View course and register <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <p>Tell us you are interested and we will contact you when the next cohort opens.</p>
              <Link href="/contact" className="mh-btn mh-btn-ink">
                Register your interest <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </section>

      <Section title="Who it is for" eyebrow="Target audience">
        <ul className="pg-tags is-lg">
          {NBA_AUDIENCE.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Section>

      {p.objectives && (
        <Section title="Learning objectives" eyebrow="What you will be able to do">
          <ul className="pg-checks">
            {p.objectives.map((o) => (
              <li key={o}>
                <Check size={16} aria-hidden="true" /> {o}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {p.skills && (
        <Section title="Skills acquired" eyebrow="Skills">
          <ul className="pg-tags is-lg">
            {p.skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Section>
      )}

      {facs.length > 0 && (
        <Section title="Facilitators" eyebrow="Taught by">
          <div className="pg-fac-row">
            {facs.map((f) => (
              <FacilitatorCard key={f.slug} f={f} href={f.slug === "mary-ekemezie" ? "/mary-ekemezie" : `/facilitators#${f.slug}`} />
            ))}
          </div>
        </Section>
      )}

      <FaqList items={faqs} />

      {related.length > 0 && (
        <Section title="Related courses" eyebrow="Keep learning">
          <PublicCourseGrid courses={related} />
        </Section>
      )}

      {articles.length > 0 && (
        <Section title="Related articles" eyebrow="Insights">
          <div className="pg-links">
            {articles.map((a) => (
              <Link key={a.id} href={`/insights/${a.slug}`} className="pg-link">
                <b>{a.title}</b>
                {a.excerpt && <small>{a.excerpt}</small>}
              </Link>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
