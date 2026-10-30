import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Search } from "lucide-react";
import { getCatalog } from "@/lib/data/learn";
import { PublicCourseGrid } from "@/components/market/PublicCourseGrid";

export const metadata: Metadata = { title: "Courses", alternates: { canonical: "/courses" } };

type Props = { searchParams: Promise<{ q?: string; level?: string }> };

const LEVELS = ["beginner", "intermediate", "advanced"];

// Public course catalogue with search (?q=) and a level filter (?level=).
export default function CoursesPage({ searchParams }: Props) {
  return (
    <div className="et-mkt">
      <section className="et-mkt-hero is-tight">
        <h1>Courses</h1>
        <form action="/courses" role="search" className="et-public-search" style={{ maxWidth: 520, width: "100%" }}>
          <Search size={16} aria-hidden="true" />
          <input type="search" name="q" placeholder="What do you want to learn?" aria-label="Search courses" />
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
  const { q = "", level = "" } = await searchParams;
  const needle = q.trim().toLowerCase().slice(0, 80);
  const all = await getCatalog(200);
  const courses = all.filter(
    (c) =>
      (!LEVELS.includes(level) || c.level === level) &&
      (!needle || [c.title, c.summary, c.category, c.instructor, ...c.skills].some((t) => t?.toLowerCase().includes(needle))),
  );
  return (
    <>
      <nav className="et-seg" aria-label="Level" style={{ alignSelf: "center" }}>
        {["", ...LEVELS].map((l) => (
          <a key={l || "all"} href={`/courses?${new URLSearchParams({ ...(needle ? { q: needle } : {}), ...(l ? { level: l } : {}) })}`} className={level === l || (!l && !LEVELS.includes(level)) ? "is-on" : ""} style={{ textTransform: "capitalize" }}>
            {l || "All levels"}
          </a>
        ))}
      </nav>
      {courses.length ? (
        <PublicCourseGrid courses={courses} />
      ) : (
        <p className="et-empty">{needle ? `No courses match "${q}".` : "No courses yet."}</p>
      )}
    </>
  );
}
