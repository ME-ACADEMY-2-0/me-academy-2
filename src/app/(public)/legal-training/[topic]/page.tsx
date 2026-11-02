import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowRight, Check } from "lucide-react";
import { getCatalog } from "@/lib/data/learn";
import { getPublicBlog } from "@/lib/data/blog";
import { PublicCourseGrid } from "@/components/market/PublicCourseGrid";
import { Crumbs, FaqList, PageHero, Section } from "@/components/market/Page";
import { TOPICS, smeSectionBySlug, topicBySlug, type Topic } from "@/lib/site-content";

type Props = { params: Promise<{ topic: string }> };

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = topicBySlug((await params).topic);
  if (!t) return { title: "Not found" };
  return { title: t.h1, description: t.summary, alternates: { canonical: `/legal-training/${t.slug}` } };
}

export default async function TopicPage({ params }: Props) {
  const t = topicBySlug((await params).topic);
  if (!t) notFound();
  const sme = t.sme ? smeSectionBySlug(t.sme) : undefined;
  return (
    <div className="mh pg">
      <Crumbs
        items={[
          { name: "Legal training", path: "/legal-training" },
          { name: t.title, path: `/legal-training/${t.slug}` },
        ]}
      />
      <PageHero eyebrow="Legal training" title={t.h1} lead={t.summary} />
      <section className="pg-prose">
        {t.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>
      <Section title="What you will learn" eyebrow={t.title}>
        <ul className="pg-checks">
          {t.learn.map((l) => (
            <li key={l}>
              <Check size={16} aria-hidden="true" /> {l}
            </li>
          ))}
        </ul>
      </Section>
      <Suspense fallback={<div className="et-skel" style={{ height: 300 }} />}>
        <TopicCourses topic={t} />
      </Suspense>
      {sme && (
        <section className="pg-callout">
          <div>
            <span className="mh-eyebrow">SME Hub</span>
            <h2>{sme.title} templates for founders</h2>
            <p>{sme.intro}</p>
          </div>
          <Link href={`/sme-hub/${sme.slug}`} className="mh-btn mh-btn-ink">
            See the templates <ArrowRight size={16} />
          </Link>
        </section>
      )}
      <Suspense fallback={null}>
        <TopicArticles topic={t} />
      </Suspense>
      <FaqList items={t.faqs} />
    </div>
  );
}

const hit = (text: string, terms: string[]) => terms.some((m) => text.toLowerCase().includes(m.toLowerCase()));

async function TopicCourses({ topic }: { topic: Topic }) {
  await connection();
  const all = await getCatalog(60);
  const courses = all.filter((c) => hit([c.title, c.category, ...c.skills].filter(Boolean).join(" "), topic.match));
  return (
    <Section title={`${topic.title} courses`} eyebrow="Courses">
      {courses.length ? (
        <PublicCourseGrid courses={courses.slice(0, 8)} />
      ) : (
        <p className="et-empty">
          Courses on this topic are being added. <Link href="/courses">Browse all courses</Link>.
        </p>
      )}
    </Section>
  );
}

// Related articles are published posts that mention the topic in their title.
async function TopicArticles({ topic }: { topic: Topic }) {
  const { posts } = await getPublicBlog();
  const related = posts.filter((p) => hit(p.title, [topic.title, ...topic.match])).slice(0, 3);
  if (!related.length) return null;
  return (
    <Section title="Related articles" eyebrow="Insights">
      <div className="pg-links">
        {related.map((p) => (
          <Link key={p.id} href={`/insights/${p.slug}`} className="pg-link">
            <b>{p.title}</b>
            {p.excerpt && <small>{p.excerpt}</small>}
          </Link>
        ))}
      </div>
    </Section>
  );
}
