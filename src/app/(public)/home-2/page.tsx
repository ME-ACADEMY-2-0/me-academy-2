import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Award, BadgeCheck, Check, ChevronDown, FileText, GraduationCap, Mail, MessageCircle, PlayCircle, Smartphone, Users } from "lucide-react";
import { getCatalog } from "@/lib/data/learn";
import { getPlatformSettings, whatsappLink } from "@/lib/platform";
import { TESTIMONIALS } from "@/lib/testimonials";
import { SITE_FAQS } from "@/lib/site-content";
import { JsonLd, faqPage } from "@/lib/seo";
import { Cover } from "@/components/dash/ui";
import { Marquee } from "@/components/market/Marquee";
import { Slider } from "@/components/market/Slider";
import { ActionForm, SubmitButton } from "@/components/dash/ActionForm";
import { formatPrice } from "@/lib/format";
import { sendContactMessage } from "../contact/actions";

/* eslint-disable @next/next/no-img-element */

// An alternative home page layout. Kept out of search results and the sitemap.
export const metadata: Metadata = {
  title: "Home 2",
  robots: { index: false, follow: false },
};

const WHAT = [
  { icon: GraduationCap, title: "Legal training", body: "Ten practice areas, from banking and finance to project finance.", href: "/legal-training" },
  { icon: BadgeCheck, title: "NBA-ICLE approved CPD", body: "Live programmes and recordings that attract CPD points.", href: "/nba-icle" },
  { icon: FileText, title: "SME Hub templates", body: "Legal templates for startups and small businesses.", href: "/sme-hub" },
  { icon: Award, title: "Verifiable certificates", body: "Finish a course and earn a certificate anyone can verify.", href: "/courses" },
];

const FEATURES = [
  { icon: Users, title: "Expert-led learning", body: "Learn from legal professionals with real-world experience in the transactions they teach." },
  { icon: Smartphone, title: "Convenient practice", body: "Flexible, hands-on training that fits around a busy schedule, on a phone or a laptop." },
  { icon: PlayCircle, title: "Video lectures", body: "Recorded lessons and slides you can return to whenever you need them." },
  { icon: Award, title: "Verifiable certificates", body: "Earn a certificate with an ID that anyone can check." },
];

const FAQ_QUESTIONS = [
  "What is ME Academy?",
  "Who is ME Academy for?",
  "How do the courses work?",
  "Do courses attract CPD points?",
  "Will I get a certificate?",
  "What is the SME Hub?",
];
const FAQ_ITEMS = SITE_FAQS.flatMap((g) => g.items)
  .filter((f) => FAQ_QUESTIONS.includes(f.q))
  .sort((a, b) => FAQ_QUESTIONS.indexOf(a.q) - FAQ_QUESTIONS.indexOf(b.q));

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export default function HomeTwo() {
  return (
    <div className="h2">
      {/* 1. Hero */}
      <section className="h2-hero">
        <span className="h2-label">Preparing professionals. Strengthening institutions.</span>
        <h1>Practical Corporate-Commercial &amp; Transactional Legal Education</h1>
        <p>Expert led courses with over 7 decades of combined experience, taught by the practitioners who work on the transactions.</p>
        <div className="h2-ctas">
          <Link href="/courses" className="h2-btn is-solid">
            Find courses
          </Link>
          <Link href="/signup" className="h2-btn">
            Register now
          </Link>
        </div>
        <div className="h2-photos">
          <figure>
            <img src="/content/people/onyinye-okafor-landscape.png" alt="Onyinye Okafor" className="is-wide" />
          </figure>
          <figure>
            <img src="/content/people/mary-ekemezie-landscape.png" alt="Mary Ekemezie, Founder & Lead Facilitator, ME Academy" className="is-wide" />
          </figure>
          <figure>
            <img src="/content/people/joseph-eimunjeze-landscape.png" alt="Joseph Eimunjeze" />
          </figure>
        </div>
      </section>

      {/* 2. What we do */}
      <section className="h2-split is-blue">
        <div className="h2-split-copy">
          <span className="h2-label is-ink">What we do</span>
          <h2>Delivering practical training through experienced practitioners</h2>
          <p>We bridge the gap between formal legal education and corporate-commercial practice. Our courses and programmes are taught by lawyers who work on the transactions they teach.</p>
        </div>
        <div className="h2-cards">
          {WHAT.map(({ icon: Icon, title, body, href }) => (
            <Link key={title} href={href} className="h2-card">
              <span className="h2-ico">
                <Icon size={18} />
              </span>
              <b>{title}</b>
              <p>{body}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="h2-panel">
        {/* 3. Courses slider */}
        <section className="h2-block">
          <div className="h2-head-row">
            <div className="h2-head">
              <span className="h2-label is-ink">Courses</span>
              <h2>Start with a course your peers recommend</h2>
            </div>
            <Link href="/courses" className="h2-btn is-solid">
              View all courses <ArrowRight size={16} />
            </Link>
          </div>
          <Suspense fallback={<div className="et-skel" style={{ height: 420 }} />}>
            <CourseSlider />
          </Suspense>
        </section>

        {/* 4. Features */}
        <section className="h2-split">
          <div className="h2-split-copy">
            <span className="h2-label is-ink">Features</span>
            <h2>Everything you need to learn practical legal skills</h2>
            <p>From recorded lectures to verifiable certificates, every course is built to be used on the job the week after you finish it.</p>
          </div>
          <div className="h2-dark-list">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="h2-dark">
                <Icon size={26} aria-hidden="true" />
                <span>
                  <b>{title}</b>
                  <small>{body}</small>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 5. Testimonials */}
      <section className="h2-block">
        <div className="h2-head is-center">
          <span className="h2-label is-ink">Testimonials</span>
          <h2>Hear from lawyers who have taken the courses</h2>
        </div>
        <Slider label="Testimonials">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="h2-quote">
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <span className="h2-av">{initials(t.name)}</span>
                <span>
                  <b>{t.name}</b>
                  <small>{t.course}</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </Slider>
      </section>

      {/* 6. FAQ */}
      <section className="h2-block">
        <JsonLd data={faqPage(FAQ_ITEMS)} />
        <div className="h2-head is-center">
          <span className="h2-label is-ink">Answers for your questions</span>
          <h2>Frequently asked questions</h2>
        </div>
        <div className="h2-faq">
          {FAQ_ITEMS.map((f, i) => (
            <details key={f.q}>
              <summary>
                <span className="h2-num">{i + 1}</span>
                {f.q}
                <ChevronDown size={16} aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
        <Link href="/faq" className="h2-link h2-center">
          See all questions <ArrowRight size={14} />
        </Link>
      </section>

      {/* 7. Contact */}
      <section className="h2-contact">
        <div className="h2-contact-copy">
          <span className="h2-label is-ink">Contact</span>
          <h2>Get in touch</h2>
          <p>Questions about a course or the SME Hub? Send us a message and we will reply, usually within one working day.</p>
          <Suspense fallback={null}>
            <Channels />
          </Suspense>
        </div>
        <div className="h2-form">
          <ActionForm action={sendContactMessage} className="et-form">
            <div className="et-form-grid">
              <div className="et-field">
                <label htmlFor="h2-name">Your name</label>
                <input id="h2-name" name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Enter name" />
              </div>
              <div className="et-field">
                <label htmlFor="h2-email">Email</label>
                <input id="h2-email" name="email" type="email" required maxLength={200} autoComplete="email" placeholder="Enter email" />
              </div>
              <div className="et-field et-field-wide">
                <label htmlFor="h2-message">Message</label>
                <textarea id="h2-message" name="message" rows={4} required minLength={10} maxLength={5000} placeholder="Enter message" />
              </div>
            </div>
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="et-hp" />
            <div>
              <SubmitButton pendingLabel="Sending...">Send message</SubmitButton>
            </div>
          </ActionForm>
        </div>
      </section>

      {/* Closing banner */}
      <section className="h2-banner">
        <div>
          <h2>Ready to start learning?</h2>
          <p>Create an account and start your first course today.</p>
        </div>
        <Link href="/signup" className="h2-btn is-light">
          Register now <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}

async function CourseSlider() {
  await connection();
  const courses = await getCatalog(8);
  const list = [...courses].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)).slice(0, 8);
  if (!list.length) return <p className="et-empty">Courses will appear here once they&apos;re published in Admin › Courses.</p>;
  return (
    <Marquee label="Featured courses">
      {list.map((c) => (
        <article key={c.id} className="h2-course">
          <div className="h2-course-media">
            <Cover url={c.coverUrl} />
          </div>
          <h3>{c.title}</h3>
          {c.summary && <p>{c.summary}</p>}
          {c.skills.length > 0 && (
            <div className="h2-outcome">
              <b>You will learn</b>
              <ul>
                {c.skills.slice(0, 2).map((s) => (
                  <li key={s}>
                    <Check size={14} aria-hidden="true" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="h2-course-foot">
            <Link href={`/courses/${c.slug}`} className="h2-btn is-solid">
              View course
            </Link>
            <span className="h2-price">{c.priceMinor === 0 ? "Free" : formatPrice(c.priceMinor, c.currency)}</span>
          </div>
        </article>
      ))}
    </Marquee>
  );
}

// Email and WhatsApp from Admin > Settings > Platform.
async function Channels() {
  const s = await getPlatformSettings();
  const email = s.supportEmail || process.env.CONTACT_INBOX || "";
  if (!email && !s.supportWhatsapp) return null;
  return (
    <ul className="h2-channels">
      {email && (
        <li>
          <Mail size={16} aria-hidden="true" />
          <a href={`mailto:${email}`}>{email}</a>
        </li>
      )}
      {s.supportWhatsapp && (
        <li>
          <MessageCircle size={16} aria-hidden="true" />
          <a href={whatsappLink(s.supportWhatsapp)} target="_blank" rel="noopener noreferrer">
            {s.supportWhatsapp}
          </a>
        </li>
      )}
    </ul>
  );
}
