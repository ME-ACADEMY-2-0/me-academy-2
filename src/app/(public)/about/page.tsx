import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, BookOpen, CircleHelp, ShieldCheck, Smartphone, Users } from "lucide-react";
import { getSiteStats } from "@/lib/data/site";
import { getBrand } from "@/lib/brand";
import { Testimonials } from "@/components/market/Testimonials";
import { FACILITATORS, MARY_ACADEMY_ROLE } from "@/lib/site-content";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return { title: `About ${brand.name}`, description: brand.tagline, alternates: { canonical: "/about" } };
}

const BELIEFS = [
  { icon: Users, title: "Taught by practitioners", body: "Every course is built by people who do the work every day." },
  { icon: Smartphone, title: "Learn anywhere", body: "Lessons work on a phone, a laptop and a normal data plan." },
  { icon: CircleHelp, title: "Help when you need it", body: "Quizzes check your understanding and support is one message away." },
  { icon: ShieldCheck, title: "Proof that counts", body: "Every certificate carries an ID anyone can check online." },
];

export default async function AboutPage() {
  const brand = await getBrand();
  return (
    <div className="et-mkt">
      <section className="et-mkt-hero">
        <span className="et-home-pill">About {brand.name}</span>
        <h1>Bridging the gap between legal education and practice.</h1>
        <p>{brand.tagline}</p>
        <div className="et-home-ctas">
          <Link href="/courses" className="et-btn et-btn-primary et-home-btn">
            Browse courses <ArrowRight size={16} />
          </Link>
          <Link href="/contact" className="et-btn et-btn-ghost et-home-btn">
            Contact us
          </Link>
        </div>
      </section>

      <Suspense fallback={null}>
        <Stats />
      </Suspense>

      <section className="et-mkt-split">
        <div>
          <h2>Our mission</h2>
          <p>{brand.name} bridges the gap between formal legal education and practice. Experienced legal practitioners teach the commercial, transactional and governance skills that the classroom leaves out.</p>
          <h2 style={{ marginTop: 28 }}>Our vision</h2>
          <p>Lawyers who can move into commercial practice with confidence, and institutions with the people they need to be well governed.</p>
        </div>
        <div className="et-card et-card-pad et-fac-founder">
          <img src="/content/people/mary-ekemezie.png" alt="Mary Ekemezie" />
          <div>
            <small>{MARY_ACADEMY_ROLE}</small>
            <b>Mary Ekemezie</b>
            <p>Founded ME Academy in 2021. A corporate and commercial lawyer who leads the academy&apos;s training in transactions, governance and legal advisory.</p>
            <Link href="/mary-ekemezie" className="mh-link" style={{ marginTop: 10 }}>
              About Mary Ekemezie <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="et-home-section">
        <div className="et-home-head">
          <h2>Our facilitators</h2>
          <Link href="/facilitators">Full profiles</Link>
        </div>
        <div className="et-fac-grid">
          {FACILITATORS.map((f) => (
            <div key={f.name} className="et-card et-fac-card">
              <img src={f.photo} alt={f.name} loading="lazy" />
              <div>
                <b>{f.name}</b>
                <p>{f.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="et-home-section">
        <h2>Organizations whose teams have learned with us</h2>
        <div className="et-orgs">
          {Array.from({ length: 12 }, (_, i) => (
            <img key={i} src={`/content/orgs/org-${i}.png`} alt="" loading="lazy" />
          ))}
        </div>
      </section>

      <section className="et-home-section">
        <h2>What participants say</h2>
        <Testimonials />
      </section>

      <section className="et-home-section">
        <h2>What we believe</h2>
        <div className="et-mkt-grid-4">
          {BELIEFS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="et-card et-card-pad et-mkt-tile">
              <span className="et-set-icon">
                <Icon size={18} />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="et-mkt-links">
        <Link href="/courses" className="et-card et-card-pad">
          <b>All courses</b>
          <small>Everything you can learn here</small>
        </Link>
        <Link href="/help" className="et-card et-card-pad">
          <b>Help centre</b>
          <small>Answers about courses, payments and certificates</small>
        </Link>
        <Link href="/insights" className="et-card et-card-pad">
          <b>Read our insights</b>
          <small>Guides and articles on corporate-commercial practice</small>
        </Link>
        <Link href="/contact" className="et-card et-card-pad">
          <b>Contact us</b>
          <small>Talk to the team</small>
        </Link>
      </section>

      <section className="et-card et-home-cta">
        <BookOpen size={22} />
        <h2>Start learning today</h2>
        <p>Register and find the course that fits your practice.</p>
        <div className="et-home-ctas">
          <Link href="/signup" className="et-btn et-btn-primary et-home-btn">
            Register now <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

// Live numbers only, and hidden until they're big enough to be worth showing.
async function Stats() {
  const s = await getSiteStats();
  if (s.learners < 100) return null;
  const items = [
    { label: "Courses", value: s.courses },
    { label: "Instructors", value: s.instructors },
    { label: "Learners", value: s.learners },
    { label: "Certificates issued", value: s.certificates },
  ].filter((i) => i.value > 0);
  if (items.length < 2) return null;
  return (
    <section className="et-card et-mkt-stats">
      {items.map((i) => (
        <div key={i.label}>
          <b>{i.value.toLocaleString()}</b>
          <small>{i.label}</small>
        </div>
      ))}
    </section>
  );
}
