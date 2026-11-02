import Link from "next/link";
import { ArrowUpRight, ChevronRight, Plus } from "lucide-react";
import { JsonLd, breadcrumbs, faqPage } from "@/lib/seo";
import type { Faq } from "@/lib/site-content";

/* eslint-disable @next/next/no-img-element */

export function Crumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Home", path: "/" }, ...items])} />
      <nav className="pg-crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        {items.map((it, i) => (
          <span key={it.path}>
            <ChevronRight size={13} aria-hidden="true" />
            {i === items.length - 1 ? <span aria-current="page">{it.name}</span> : <Link href={it.path}>{it.name}</Link>}
          </span>
        ))}
      </nav>
    </>
  );
}

export function PageHero({ eyebrow, title, lead, children, tone = "ink" }: { eyebrow?: string; title: string; lead?: string; children?: React.ReactNode; tone?: "ink" | "plain" }) {
  return (
    <header className={`pg-hero is-${tone}`}>
      {eyebrow && <span className="mh-eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {lead && <p>{lead}</p>}
      {children}
    </header>
  );
}

export function Section({ title, eyebrow, children, id }: { title?: string; eyebrow?: string; children: React.ReactNode; id?: string }) {
  return (
    <section className="mh-section" id={id}>
      {(title || eyebrow) && (
        <div className="mh-head">
          <div>
            {eyebrow && <span className="mh-eyebrow">{eyebrow}</span>}
            {title && <h2>{title}</h2>}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}

// Visible questions plus matching FAQPage structured data. The markup only ever uses what is on the page.
export function FaqList({ items, title = "Frequently asked questions", schema = true }: { items: Faq[]; title?: string; schema?: boolean }) {
  if (!items.length) return null;
  return (
    <Section title={title} eyebrow="FAQ">
      {schema && <JsonLd data={faqPage(items)} />}
      <div className="pg-faq">
        {items.map((f) => (
          <details key={f.q}>
            <summary>
              {f.q}
              <Plus size={16} aria-hidden="true" />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

export function LinkCards({ items }: { items: { href: string; title: string; body: string }[] }) {
  return (
    <div className="pg-links">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className="pg-link">
          <b>{i.title}</b>
          <small>{i.body}</small>
          <span aria-hidden="true">
            <ArrowUpRight size={15} />
          </span>
        </Link>
      ))}
    </div>
  );
}

export function FacilitatorCard({ f, href }: { f: { slug: string; name: string; role: string; photo: string; bio?: string }; href?: string }) {
  const inner = (
    <>
      <img src={f.photo} alt={f.name} loading="lazy" />
      <div>
        <b>{f.name}</b>
        <small>{f.role}</small>
      </div>
    </>
  );
  return href ? (
    <Link href={href} className="pg-fac">
      {inner}
    </Link>
  ) : (
    <div className="pg-fac">{inner}</div>
  );
}
