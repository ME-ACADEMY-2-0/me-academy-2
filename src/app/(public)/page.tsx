import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, ArrowUpRight, Award, BadgeCheck, CalendarDays, FileText, GraduationCap, PlayCircle, Smartphone, Users } from "lucide-react";
import { getCatalog } from "@/lib/data/learn";
import { getPublicBlog } from "@/lib/data/blog";
import { getSiteStats } from "@/lib/data/site";
import { getSmeProducts } from "@/lib/data/sme";
import { TESTIMONIALS } from "@/lib/testimonials";
import { MARY_ACADEMY_ROLE, PROGRAMMES, SME_SECTIONS } from "@/lib/site-content";
import { PublicCourseGrid } from "@/components/market/PublicCourseGrid";
import { ActionForm, SubmitButton } from "@/components/dash/ActionForm";
import { sendContactMessage } from "./contact/actions";

/* eslint-disable @next/next/no-img-element */

const TOPIC_CARDS = [
  { title: "Corporate & Commercial Law", href: "/legal-training/corporate-commercial-law", img: "/content/courses/iccp.png" },
  { title: "Banking & Finance", href: "/legal-training/banking-finance", img: "/content/courses/banking-finance.png" },
  { title: "M&A and Equity Advisory", href: "/legal-training/ma", img: "/content/courses/lma-facility.png" },
  { title: "Project Finance", href: "/legal-training/project-finance", img: "/content/courses/project-finance.png" },
];

const SME_COVERS: Record<string, string> = {
  "startup-documents": "/content/sme/startup-pack-bundle.png",
  "investment-agreements": "/content/sme/shareholders-agreement.png",
  "employment-contracts": "/content/sme/employment-contract.png",
  "hr-policies": "/content/sme/hr-policies-pack.png",
  "corporate-governance": "/content/sme/written-resolutions-bundle.png",
};

const FEATURES = [
  { icon: Users, title: "Expert-Led Learning", body: "Learn from top legal professionals with real-world experience in the transactions they teach." },
  { icon: Smartphone, title: "Convenient Practice", body: "Flexible, hands-on training that fits around a busy schedule, on a phone or a laptop." },
  { icon: PlayCircle, title: "Video Lectures", body: "High-quality, easy-to-follow recorded lessons and slides you can return to whenever you need them." },
  { icon: Award, title: "Verifiable Certificates", body: "Finish a course to earn a certificate with an ID that anyone can check." },
];

const FACULTY = [
  { img: "/content/people/mary-ekemezie.png", name: "Mary Ekemezie" },
  { img: "/content/people/onyinye-okafor.png", name: "Onyinye Okafor" },
  { img: "/content/people/joseph-eimunjeze.png", name: "Joseph Eimunjeze" },
  { img: "/content/people/okechukwu-okoro.jpg", name: "Okechukwu Okoro" },
  { img: "/content/people/chisom-ndubuisi.jpg", name: "Chisom Ndubuisi" },
  { img: "/content/people/victor-samuel.webp", name: "Victor Samuel" },
];

const FEATURED_QUOTE = "Rachael Olayemi";
const QUOTE_ROW = ["Adaora Ann Nwana", "Chima Nwogu", "Benita Ndu-Okeke", "Yvonne Ezekiel", "Fortune Ihator"];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export default function Home() {
  const featured = TESTIMONIALS.find((t) => t.name === FEATURED_QUOTE) ?? TESTIMONIALS[0];
  const row = QUOTE_ROW.map((n) => TESTIMONIALS.find((t) => t.name === n)).filter((t): t is (typeof TESTIMONIALS)[number] => !!t);
  return (
    <div className="mh">
      {/* Hero: primary identity */}
      <section className="mh-hero">
        <div className="mh-hero-grid">
          <div className="mh-hero-copy">
            <span className="mh-eyebrow">Preparing professionals. Strengthening institutions.</span>
            <h1>
              Practical <em>Corporate-Commercial</em> &amp; Transactional Legal Education
            </h1>
            <p>Expert Led Courses. Over 7 decades worth of combined experience.</p>
            <div className="mh-ctas">
              <Link href="/signup" className="mh-btn mh-btn-amber">
                Register now <ArrowRight size={16} />
              </Link>
              <Link href="/courses" className="mh-btn mh-btn-line">
                Find courses
              </Link>
            </div>
          </div>
          <div className="mh-collage" aria-label="ME Academy facilitators">
            <figure className="mh-collage-main">
              <img src="/content/people/mary-ekemezie.png" alt="Mary Ekemezie" />
              <figcaption>
                <b>Mary Ekemezie</b>
                <small>{MARY_ACADEMY_ROLE}</small>
              </figcaption>
            </figure>
            <figure className="mh-collage-a">
              <img src="/content/people/onyinye-okafor.png" alt="Onyinye Okafor" />
            </figure>
            <figure className="mh-collage-b">
              <img src="/content/people/joseph-eimunjeze.png" alt="Joseph Eimunjeze" />
            </figure>
          </div>
        </div>
        <nav className="mh-hero-bar" aria-label="Start here">
          <Link href="/legal-training">
            <GraduationCap size={18} /> Legal training <ArrowUpRight size={15} />
          </Link>
          <Link href="/nba-icle">
            <BadgeCheck size={18} /> NBA-ICLE approved CPD <ArrowUpRight size={15} />
          </Link>
          <Link href="/sme-hub">
            <FileText size={18} /> SME Hub templates <ArrowUpRight size={15} />
          </Link>
        </nav>
      </section>

      {/* Primary: practice areas */}
      <section className="mh-section">
        <div className="mh-head is-center">
          <span className="mh-eyebrow">Legal training</span>
          <h2>Practical training for every stage of transactional practice</h2>
        </div>
        <div className="mh-topics">
          {TOPIC_CARDS.map((t) => (
            <Link key={t.title} href={t.href} className="mh-topic">
              <img src={t.img} alt="" loading="lazy" />
              <span>
                {t.title}
                <i>
                  <ArrowUpRight size={15} />
                </i>
              </span>
            </Link>
          ))}
        </div>
        <Link href="/legal-training" className="mh-btn mh-btn-amber mh-center">
          Explore all legal training
        </Link>
      </section>

      {/* Featured courses */}
      <section className="mh-section">
        <div className="mh-head">
          <div>
            <span className="mh-eyebrow">Top level courses</span>
            <h2>Start with a course your peers recommend</h2>
          </div>
          <Link href="/courses" className="mh-link">
            See all courses <ArrowRight size={14} />
          </Link>
        </div>
        <Suspense fallback={<div className="et-skel" style={{ height: 320 }} />}>
          <Featured />
        </Suspense>
      </section>

      {/* Secondary: NBA-ICLE flagship */}
      <section className="mh-nba">
        <div className="mh-nba-copy">
          <span className="mh-eyebrow">NBA-ICLE approved CPD programmes</span>
          <h2>NBA-ICLE Approved Legal Training</h2>
          <p>NBA-ICLE has approved ME Academy as an accredited service provider. Choose live cohorts with real-time Q&amp;A, or recordings of past approved courses you can watch at your own pace.</p>
          <div className="mh-nba-paths">
            <span>
              <CalendarDays size={18} /> Live programmes
            </span>
            <span>
              <PlayCircle size={18} /> Past approved recordings
            </span>
          </div>
          <Link href="/nba-icle" className="mh-btn mh-btn-ink">
            Explore the NBA-ICLE hub <ArrowRight size={16} />
          </Link>
        </div>
        <ul className="mh-nba-list">
          {PROGRAMMES.slice(0, 5).map((p) => (
            <li key={p.slug}>
              <Link href={`/nba-icle/${p.slug}`}>
                <span>
                  <small>{p.kind === "live" ? "Live programme" : "Recording"}</small>
                  <b>{p.title}</b>
                </span>
                <ArrowUpRight size={16} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Third: SME Hub */}
      <section className="mh-section">
        <div className="mh-head">
          <div>
            <span className="mh-eyebrow">SME Hub</span>
            <h2>Legal &amp; business resources for Nigerian startups and SMEs</h2>
          </div>
          <Link href="/sme-hub" className="mh-link">
            See all templates <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mh-sme">
          {SME_SECTIONS.map((s) => (
            <Link key={s.slug} href={`/sme-hub/${s.slug}`} className="mh-sme-card">
              <img src={SME_COVERS[s.slug]} alt="" loading="lazy" />
              <span>
                <b>{s.title}</b>
                <ArrowUpRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Dark band: why us + stats */}
      <section className="mh-band">
        <div className="mh-band-head">
          <span className="mh-eyebrow">Our approach</span>
          <h2>Learning built around the transactions you will actually work on</h2>
        </div>
        <div className="mh-feats">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="mh-feat">
              <span>
                <Icon size={18} />
              </span>
              <b>{title}</b>
              <p>{body}</p>
            </div>
          ))}
        </div>
        <Suspense fallback={<Stats />}>
          <LiveStats />
        </Suspense>
      </section>

      {/* Faculty strip */}
      <section className="mh-strip">
        <div className="mh-strip-faces">
          {FACULTY.map((f) => (
            <img key={f.name} src={f.img} alt={f.name} loading="lazy" />
          ))}
        </div>
        <div className="mh-strip-cap">
          <h3>Turning rookies into experts within a short time.</h3>
          <Link href="/signup" className="mh-btn mh-btn-amber">
            Register now <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {/* Organisations */}
      <section className="mh-section">
        <div className="mh-head is-center">
          <span className="mh-eyebrow">Alumni</span>
          <h2>Organisations whose teams have learned with us</h2>
        </div>
        <div className="mh-logos">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i}>
              <img src={`/content/orgs/org-${i}.png`} alt="" loading="lazy" />
            </span>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mh-section">
        <div className="mh-head is-center">
          <span className="mh-eyebrow">What participants say</span>
          <h2>Hear from lawyers who have taken the courses</h2>
        </div>
        <div className="mh-quotes">
          <figure className="mh-quote-main">
            <blockquote>{featured.quote}</blockquote>
            <figcaption>
              <span className="mh-av">{initials(featured.name)}</span>
              <span>
                <b>{featured.name}</b>
                <small>{featured.course}</small>
              </span>
            </figcaption>
          </figure>
          <aside className="mh-quote-cta">
            <h3>Learn from the people who do the deals.</h3>
            <p>Join the next cohort or start a recorded course today.</p>
            <Link href="/signup" className="mh-btn mh-btn-ink">
              Register now <ArrowUpRight size={16} />
            </Link>
          </aside>
        </div>
        <div className="mh-quote-row">
          {row.map((t) => (
            <figure key={t.name} className="mh-quote-small">
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <span className="mh-av">{initials(t.name)}</span>
                <span>
                  <b>{t.name}</b>
                  <small>{t.course}</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Latest insights (hidden until there are posts) */}
      <Suspense fallback={null}>
        <Insights />
      </Suspense>

      {/* Let's connect */}
      <section className="mh-connect">
        <div className="mh-connect-form">
          <span className="mh-eyebrow">Get in touch</span>
          <h2>Let&apos;s connect</h2>
          <p>Questions about a course or the SME Hub? Send us a message and we will reply, usually within one working day.</p>
          <ActionForm action={sendContactMessage} className="et-form">
            <div className="et-form-grid">
              <div className="et-field">
                <label htmlFor="h-name">Your name</label>
                <input id="h-name" name="name" required minLength={2} maxLength={100} autoComplete="name" />
              </div>
              <div className="et-field">
                <label htmlFor="h-email">Email</label>
                <input id="h-email" name="email" type="email" required maxLength={200} autoComplete="email" />
              </div>
              <div className="et-field et-field-wide">
                <label htmlFor="h-message">Message</label>
                <textarea id="h-message" name="message" rows={4} required minLength={10} maxLength={5000} />
              </div>
            </div>
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="et-hp" />
            <div>
              <SubmitButton pendingLabel="Sending...">Send message</SubmitButton>
            </div>
          </ActionForm>
        </div>
        <div className="mh-connect-art">
          <img src="/content/people/onyinye-okafor.png" alt="" loading="lazy" />
          <div>
            <b>Prefer to talk it through?</b>
            <Link href="/contact">
              More ways to reach us <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

type StatItem = { value: string; label: string };

function Stats({ items }: { items?: StatItem[] }) {
  const list = items ?? [
    { value: "7+", label: "Decades of combined experience" },
    { value: "7", label: "Expert facilitators" },
    { value: "...", label: "Courses" },
    { value: "...", label: "Ready-to-use templates" },
  ];
  return (
    <dl className="mh-stats">
      {list.map((s) => (
        <div key={s.label}>
          <dt>{s.value}</dt>
          <dd>{s.label}</dd>
        </div>
      ))}
    </dl>
  );
}

async function LiveStats() {
  await connection();
  const [site, sme] = await Promise.all([getSiteStats(), getSmeProducts()]);
  return (
    <Stats
      items={[
        { value: "7+", label: "Decades of combined experience" },
        { value: "7", label: "Expert facilitators" },
        { value: String(site.courses), label: "Courses" },
        { value: String(sme.length), label: "Ready-to-use templates" },
      ]}
    />
  );
}

async function Featured() {
  await connection();
  const courses = await getCatalog(8);
  const featured = [...courses].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)).slice(0, 4);
  if (!featured.length) return <p className="et-empty">Courses will appear here once they&apos;re published in Admin › Courses.</p>;
  return <PublicCourseGrid courses={featured} />;
}

async function Insights() {
  const { posts } = await getPublicBlog();
  const latest = posts.slice(0, 2);
  if (!latest.length) return null;
  return (
    <section className="mh-section">
      <div className="mh-head">
        <div>
          <span className="mh-eyebrow">Insights</span>
          <h2>Our latest insights</h2>
        </div>
        <Link href="/insights" className="mh-link">
          All articles <ArrowRight size={14} />
        </Link>
      </div>
      <div className="mh-posts">
        {latest.map((p) => (
          <Link key={p.id} href={`/insights/${p.slug}`} className="mh-post">
            {p.cover_url ? <img src={p.cover_url} alt="" loading="lazy" /> : <span className="mh-post-ph" aria-hidden="true" />}
            <span>
              <b>{p.title}</b>
              {p.excerpt && <small>{p.excerpt}</small>}
            </span>
            <i>
              <ArrowUpRight size={15} />
            </i>
          </Link>
        ))}
      </div>
    </section>
  );
}
