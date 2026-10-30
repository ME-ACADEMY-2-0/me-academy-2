import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Award, BookOpen, CircleCheck, PlayCircle, Smartphone } from "lucide-react";
import { getCatalog } from "@/lib/data/learn";
import { getBrand } from "@/lib/brand";
import { PublicCourseGrid } from "@/components/market/PublicCourseGrid";

// STARTER HOME PAGE. This is the page each client usually wants redesigned. Keep the data parts (getBrand,
// getCatalog) and replace the layout and copy. See docs/SETUP.md, stage 7.

const STEPS = [
  { icon: BookOpen, title: "Pick a course", body: "Browse the catalogue and enroll in a free course, or buy one in a couple of taps." },
  { icon: PlayCircle, title: "Learn at your pace", body: "Video and reading lessons, notes, quizzes and resources, saved as you go." },
  { icon: Award, title: "Earn your certificate", body: "Finish the course to get a certificate with an ID anyone can verify." },
];

const PERKS = [
  { icon: Smartphone, title: "Works on any device", body: "Install it on your phone like an app, or learn on a laptop." },
  { icon: CircleCheck, title: "Track your progress", body: "Streaks, badges and a dashboard that shows what to do next." },
];

export default async function Home() {
  const brand = await getBrand();
  return (
    <div className="et-mkt">
      <section className="et-home-hero">
        <span className="et-home-pill">{brand.name}</span>
        <h1 style={{ maxWidth: "44rem", fontSize: "clamp(32px,5.4vw,58px)", fontWeight: 800, letterSpacing: "-.035em", lineHeight: 1.05 }}>Learn new skills, at your own pace.</h1>
        <p style={{ maxWidth: "38rem", color: "var(--a-muted)", fontSize: "clamp(15px,1.6vw,17px)", lineHeight: 1.65 }}>{brand.tagline}</p>
        <div className="et-home-ctas">
          <Link href="/courses" className="et-btn et-btn-primary et-home-btn">
            Browse courses <ArrowRight size={16} />
          </Link>
          <Link href="/signup" className="et-btn et-btn-ghost et-home-btn">
            Create a free account
          </Link>
        </div>
      </section>

      <section className="et-home-section">
        <div className="et-home-head">
          <h2>Popular courses</h2>
          <Link href="/courses">See all</Link>
        </div>
        <Suspense fallback={<div className="et-skel" style={{ height: 320 }} />}>
          <Featured />
        </Suspense>
      </section>

      <section className="et-home-section">
        <h2>How it works</h2>
        <div className="et-home-steps">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="et-card et-card-pad et-mkt-tile" style={{ position: "relative" }}>
              <span className="et-home-step-n">{i + 1}</span>
              <Icon size={22} className="et-home-step-icon" />
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="et-home-section">
        <div className="et-home-perks">
          {PERKS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="et-home-perk">
              <span className="et-set-icon">
                <Icon size={18} />
              </span>
              <span>
                <b>{title}</b>
                <p className="et-muted" style={{ margin: "4px 0 0" }}>
                  {body}
                </p>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="et-card et-home-cta">
        <h2>Ready to start?</h2>
        <p>Create your free account in under a minute.</p>
        <div className="et-home-ctas">
          <Link href="/signup" className="et-btn et-btn-primary et-home-btn">
            Get started free <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

async function Featured() {
  await connection();
  const courses = await getCatalog(8);
  const featured = [...courses].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)).slice(0, 8);
  if (!featured.length) return <p className="et-empty">Courses will appear here once they&apos;re published in Admin › Courses.</p>;
  return <PublicCourseGrid courses={featured} />;
}
