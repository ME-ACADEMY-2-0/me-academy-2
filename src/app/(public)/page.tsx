import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, ArrowUpRight, Award, BookOpen, Check, PlayCircle, Smartphone, Star, UserPlus, Users } from "lucide-react";
import { getCatalog } from "@/lib/data/learn";
import { getPublicBlog } from "@/lib/data/blog";
import { getSiteStats } from "@/lib/data/site";
import { TESTIMONIALS } from "@/lib/testimonials";
import { MARY_ACADEMY_ROLE, SITE_FAQS } from "@/lib/site-content";
import { FaqList } from "@/components/market/Page";
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

const FEATURES = [
  { icon: Users, title: "Expert-Led Learning", body: "Learn from top legal professionals with real-world experience in the transactions they teach." },
  { icon: Smartphone, title: "Convenient Practice", body: "Flexible, hands-on training that fits around a busy schedule, on a phone or a laptop." },
  { icon: PlayCircle, title: "Video Lectures", body: "High-quality, easy-to-follow recorded lessons and slides you can return to whenever you need them." },
  { icon: Award, title: "Verifiable Certificates", body: "Finish a course to earn a certificate with an ID that anyone can check." },
];

const STEPS = [
  { icon: UserPlus, title: "Create your account", body: "Sign up in a minute and your courses, progress and certificates stay in one place." },
  { icon: BookOpen, title: "Choose a course", body: "Browse by practice area or level and pick the course that fits the work you do." },
  { icon: PlayCircle, title: "Learn at your pace", body: "Watch recorded lessons and slides on a phone or laptop, and return to them whenever you need." },
  { icon: Award, title: "Earn your certificate", body: "Finish the course to receive a certificate with an ID that anyone can verify." },
];

const HOME_FAQ = [
  "What is ME Academy?",
  "Who is ME Academy for?",
  "How do the courses work?",
  "Do courses attract CPD points?",
  "Will I get a certificate?",
  "What is the SME Hub?",
];
const FAQ_ITEMS = SITE_FAQS.flatMap((g) => g.items).filter((f) => HOME_FAQ.includes(f.q)).sort((a, b) => HOME_FAQ.indexOf(a.q) - HOME_FAQ.indexOf(b.q));

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
            <span className="mh-pill">Preparing professionals. Strengthening institutions.</span>
            <h1>
              Practical <em>Corporate-Commercial</em> &amp; Transactional Legal Education
            </h1>
            <div className="mh-proof">
              <span className="mh-avatars" aria-hidden="true">
                <img src="/content/people/mary-ekemezie.png" alt="" />
                <img src="/content/people/onyinye-okafor.png" alt="" />
                <img src="/content/people/joseph-eimunjeze.png" alt="" />
              </span>
              <p>
                <b>Expert Led Courses</b>
                <span>Over 7 decades worth of combined experience</span>
              </p>
            </div>
            <div className="mh-ctas">
              <Link href="/signup" className="mh-btn mh-btn-amber">
                Register now <ArrowRight size={16} />
              </Link>
              <Link href="/courses" className="mh-btn mh-btn-line">
                Find courses
              </Link>
            </div>
          </div>
          <div className="mh-float" aria-label="ME Academy facilitators">
            <figure className="mh-float-main">
              <img src="/content/people/mary-ekemezie.png" alt="Mary Ekemezie" />
            </figure>
            <div className="mh-float-card">
              <img src="/content/people/mary-ekemezie.png" alt="" />
              <div>
                <b>Mary Ekemezie</b>
                <span>
                  <span className="mh-stars" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </span>
                  {MARY_ACADEMY_ROLE}
                </span>
              </div>
            </div>
            <figure className="mh-float-a">
              <img src="/content/people/onyinye-okafor.png" alt="Onyinye Okafor" />
            </figure>
            <figure className="mh-float-b">
              <img src="/content/people/joseph-eimunjeze.png" alt="Joseph Eimunjeze" />
            </figure>
          </div>
        </div>
      </section>

      {/* About us */}
      <section className="mh-about">
        <figure className="mh-about-media">
          <img src="/content/people/mary-ekemezie.png" alt="Mary Ekemezie" loading="lazy" />
          <figcaption>
            <b>Mary Ekemezie</b>
            <small>{MARY_ACADEMY_ROLE}</small>
          </figcaption>
        </figure>
        <div className="mh-about-copy">
          <span className="mh-eyebrow">About ME Academy</span>
          <h2>Practical training from lawyers who do the deals</h2>
          <p>ME Academy was founded in 2021 by Mary Ekemezie. We bridge the gap between formal legal education and corporate-commercial practice, with practical, transactional skills taught by experienced practitioners.</p>
          <ul className="mh-checks">
            <li>
              <Check size={16} aria-hidden="true" /> Over 7 decades of combined experience
            </li>
            <li>
              <Check size={16} aria-hidden="true" /> Recorded courses and live cohorts
            </li>
            <li>
              <Check size={16} aria-hidden="true" /> NBA-ICLE approved CPD programmes
            </li>
          </ul>
          <div className="mh-ctas">
            <Link href="/about" className="mh-btn mh-btn-amber">
              About us <ArrowRight size={16} />
            </Link>
            <Link href="/facilitators" className="mh-btn mh-btn-line">
              Meet the facilitators
            </Link>
          </div>
        </div>
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

      {/* Why choose us */}
      <section className="mh-section">
        <div className="mh-head is-center">
          <span className="mh-eyebrow">Why ME Academy</span>
          <h2>Learning built around the transactions you will actually work on</h2>
        </div>
        <div className="mh-feats is-light">
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
      </section>

      {/* How it works */}
      <section className="mh-section">
        <div className="mh-head is-center">
          <span className="mh-eyebrow">How it works</span>
          <h2>From sign-up to certificate in four steps</h2>
        </div>
        <ol className="mh-steps">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title}>
              <span className="mh-step-n">{i + 1}</span>
              <Icon size={22} aria-hidden="true" />
              <b>{title}</b>
              <p>{body}</p>
            </li>
          ))}
        </ol>
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

      {/* Stats band */}
      <section className="mh-band">
        <div className="mh-band-head">
          <span className="mh-eyebrow">ME Academy in numbers</span>
          <h2>Practical legal education, built on decades of practice</h2>
        </div>
        <Suspense fallback={<Stats />}>
          <LiveStats />
        </Suspense>
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

      {/* Call to action */}
      <section className="mh-cta">
        <div>
          <h2>Ready to start learning?</h2>
          <p>Create an account and start your first course today, or talk to us first.</p>
        </div>
        <div className="mh-ctas">
          <Link href="/signup" className="mh-btn mh-btn-amber">
            Register now <ArrowRight size={16} />
          </Link>
          <Link href="/contact" className="mh-btn mh-btn-line">
            Contact us
          </Link>
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

      {/* FAQ */}
      <div className="mh-faq">
        <FaqList items={FAQ_ITEMS} title="Questions people ask before they start" />
        <Link href="/faq" className="mh-link">
          See all questions <ArrowRight size={14} />
        </Link>
      </div>
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
  const site = await getSiteStats();
  return (
    <Stats
      items={[
        { value: "7+", label: "Decades of combined experience" },
        { value: "7", label: "Expert facilitators" },
        { value: String(site.courses), label: "Courses" },
        { value: "2021", label: "Year founded" },
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
