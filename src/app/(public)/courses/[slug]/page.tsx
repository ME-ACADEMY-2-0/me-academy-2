import { Suspense } from "react";
import { JsonLd, breadcrumbs, course as seoCourse } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CourseView } from "@/components/market/CourseView";
import { courseMeta, getCourseDetails } from "@/lib/data/learn";
import { FacilitatorCard, FaqList, Section } from "@/components/market/Page";
import { COURSE_FACILITATORS, PROGRAMMES, courseFaqs, facilitatorBySlug } from "@/lib/site-content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = await courseMeta(slug);
  if (!meta) return { title: "Course not found", robots: { index: false } };
  const description = meta.summary || `Learn ${meta.title}, with a certificate when you finish.`;
  return {
    title: meta.title,
    description,
    alternates: { canonical: `/courses/${slug}` },
    openGraph: { type: "website", title: meta.title, description, images: meta.cover ? [meta.cover] : undefined },
    twitter: { card: meta.cover ? "summary_large_image" : "summary", title: meta.title, description },
  };
}

// Public course page: anyone can see it, so shared links and search engines land on the real course.
export default function PublicCourse({ params }: Props) {
  return (
    <Suspense fallback={<div className="et-skel" style={{ height: 640 }} />}>
      <Course params={params} />
    </Suspense>
  );
}

async function Course({ params }: Props) {
  const data = await getCourseDetails((await params).slug);
  if (!data) notFound();
  await connection();
  const { course: c, instructor, stats } = data;
  const facs = (COURSE_FACILITATORS[c.slug] ?? []).map(facilitatorBySlug).filter((f): f is NonNullable<typeof f> => !!f);
  const nba = PROGRAMMES.find((p) => p.courseSlug === c.slug) ?? null;
  const faqs = courseFaqs({ title: c.title, summary: c.summary, level: c.level, skills: c.skills, category: c.category, facilitators: facs.map((f) => f.name), nba });
  return (
    <>
      <JsonLd
        data={[
          seoCourse({ ...c, instructor: instructor.name, facilitators: facs, nbaCpd: nba?.cpd, seconds: stats.seconds, rating: stats.rating, reviews: stats.reviews }),
          breadcrumbs([
            { name: "Courses", path: "/courses" },
            { name: c.title, path: `/courses/${c.slug}` },
          ]),
        ]}
      />
      <CourseView data={data} />
      {facs.length > 0 && (
        <div className="mh pg pg-after">
          <Section title="Facilitators" eyebrow="Taught by">
            <div className="pg-fac-row">
              {facs.map((f) => (
                <FacilitatorCard key={f.slug} f={f} href={f.slug === "mary-ekemezie" ? "/mary-ekemezie" : `/facilitators#${f.slug}`} />
              ))}
            </div>
          </Section>
        </div>
      )}
      <div className="mh pg pg-after">
        <FaqList items={faqs} />
      </div>
    </>
  );
}
