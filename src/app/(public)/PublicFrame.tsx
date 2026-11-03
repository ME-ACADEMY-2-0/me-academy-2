"use client";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Fragment, Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight, BookOpen, Briefcase, Building2, ChevronDown, CircleHelp, FileText, GraduationCap, Handshake,
  LifeBuoy, Mail, Menu, Moon, Newspaper, Scale, ScrollText, Search, Star, Sun, UserRound, Users, X,
  type LucideIcon,
} from "lucide-react";
import { useTheme, writeTheme } from "@/lib/theme";
import { CartButton } from "@/components/market/CartButton";
import { useBrand } from "@/components/brand/BrandProvider";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/nba-icle", label: "NBA-ICLE" },
  { href: "/sme-hub", label: "SME Hub" },
];

type MegaLink = { href: string; label: string; note: string; icon: LucideIcon; tone: string };

// The "Menu" mega menu: everything that is not in the main bar.
const MEGA: { title: string; links: MegaLink[] }[] = [
  {
    title: "Learn",
    links: [
      { href: "/legal-training", label: "Legal training", note: "Ten practice areas", icon: Scale, tone: "#7c3aed" },
      { href: "/facilitators", label: "Facilitators", note: "Meet the faculty", icon: Users, tone: "#4f46e5" },
      { href: "/mary-ekemezie", label: "Mary Ekemezie", note: "Founder & Lead Facilitator", icon: UserRound, tone: "#db2777" },
      { href: "/testimonials", label: "Testimonials", note: "What learners say", icon: Star, tone: "#ca8a04" },
      { href: "/alumni", label: "Alumni", note: "Our graduates", icon: GraduationCap, tone: "#16a34a" },
    ],
  },
  {
    title: "SME Hub",
    links: [
      { href: "/sme-hub/startup-documents", label: "Startup documents", note: "Get set up properly", icon: FileText, tone: "#2563eb" },
      { href: "/sme-hub/investment-agreements", label: "Investment agreements", note: "Raise with confidence", icon: Handshake, tone: "#0d9488" },
      { href: "/sme-hub/employment-contracts", label: "Employment contracts", note: "Hire the right way", icon: Briefcase, tone: "#ea580c" },
      { href: "/sme-hub/hr-policies", label: "HR policies", note: "Run a fair workplace", icon: ScrollText, tone: "#e11d48" },
      { href: "/sme-hub/corporate-governance", label: "Corporate governance", note: "Board and compliance", icon: Building2, tone: "#475569" },
    ],
  },
  {
    title: "Quick links",
    links: [
      { href: "/insights", label: "Insights", note: "Articles and commentary", icon: Newspaper, tone: "#db2777" },
      { href: "/resources", label: "Resources", note: "Guides and references", icon: BookOpen, tone: "#7c3aed" },
      { href: "/faq", label: "FAQ", note: "Quick answers", icon: CircleHelp, tone: "#2563eb" },
      { href: "/help", label: "Help centre", note: "Support for learners", icon: LifeBuoy, tone: "#e11d48" },
      { href: "/contact", label: "Contact", note: "Get in touch", icon: Mail, tone: "#0d9488" },
    ],
  },
];

const FOOTER = [
  {
    title: "Learn",
    links: [
      { href: "/legal-training", label: "Legal training" },
      { href: "/nba-icle", label: "NBA-ICLE programmes" },
      { href: "/courses", label: "All courses" },
      { href: "/insights", label: "Insights" },
      { href: "/resources", label: "Resources" },
    ],
  },
  {
    title: "SME Hub",
    links: [
      { href: "/sme-hub", label: "All templates" },
      { href: "/sme-hub/startup-documents", label: "Startup documents" },
      { href: "/sme-hub/investment-agreements", label: "Investment agreements" },
      { href: "/sme-hub/employment-contracts", label: "Employment contracts" },
      { href: "/sme-hub/hr-policies", label: "HR policies" },
      { href: "/sme-hub/corporate-governance", label: "Corporate governance" },
    ],
  },
  {
    title: "ME Academy",
    links: [
      { href: "/about", label: "About us" },
      { href: "/mary-ekemezie", label: "Mary Ekemezie" },
      { href: "/facilitators", label: "Facilitators" },
      { href: "/testimonials", label: "Testimonials" },
      { href: "/alumni", label: "Alumni" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/help", label: "Help centre" },
      { href: "/contact", label: "Contact us" },
      { href: "/certificate", label: "Verify a certificate" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/refund-policy", label: "Refund policy" },
    ],
  },
];

// Light chrome for public pages that reuses the dashboard design tokens.
export function PublicFrame({ children, footerLinks }: { children: React.ReactNode; footerLinks?: React.ReactNode }) {
  const { light } = useTheme();
  const brand = useBrand();
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const megaButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open && !mega) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        (mega ? megaButton : menuButton).current?.focus();
        setOpen(false);
        setMega(false);
      }
    };
    const onOutside = (e: PointerEvent) => {
      if (!header.current?.contains(e.target as Node)) {
        setOpen(false);
        setMega(false);
      }
    };
    const desktop = window.matchMedia("(min-width: 1001px)");
    const onResize = () => {
      setOpen(false);
      setMega(false);
    };
    document.addEventListener("pointerdown", onOutside);
    desktop.addEventListener("change", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      desktop.removeEventListener("change", onResize);
    };
  }, [open, mega]);

  const closeAll = () => {
    setOpen(false);
    setMega(false);
  };

  // A mouse opens the mega menu on hover; touch and keyboard use the button as a toggle.
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastPointer = useRef("");
  const hover = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(hoverTimer.current);
      setOpen(false);
      setMega(true);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      hoverTimer.current = setTimeout(() => setMega(false), 180);
    },
  };
  const toggleMega = (e: React.MouseEvent) => {
    if (e.detail > 0 && lastPointer.current === "mouse") setMega(true);
    else setMega(!mega);
  };

  return (
    <div className={`et-app et-public${light ? " is-light" : ""}`}>
      <header className="et-public-top" ref={header}>
        <div className="et-public-top-inner">
        <Link href="/" className="et-public-brand" aria-label="Home" onClick={closeAll}>
          <BrandLogo className="et-brand-logo" />
        </Link>
        <nav className="et-public-nav" aria-label="Main">
          {/* The current path is only known at request time, so the highlight streams in. */}
          <Suspense fallback={<NavLinks mega={mega} megaButton={megaButton} onMega={toggleMega} hover={hover} onPointerType={(t) => (lastPointer.current = t)} onNavigate={closeAll} />}>
            <ActiveNavLinks mega={mega} megaButton={megaButton} onMega={toggleMega} hover={hover} onPointerType={(t) => (lastPointer.current = t)} onNavigate={closeAll} />
          </Suspense>
        </nav>
        {mega && (
          <div id="et-mega" className="et-mega" role="region" aria-label="Menu" {...hover}>
            {MEGA.map((col) => (
              <div key={col.title} className="et-mega-col">
                <b>{col.title}</b>
                {col.links.map((l) => (
                  <Link key={l.href} href={l.href} className="et-mega-link" onClick={closeAll}>
                    <span className="et-mega-ico" style={{ "--c": l.tone } as React.CSSProperties}>
                      <l.icon size={20} aria-hidden="true" />
                    </span>
                    <span>
                      <strong>{l.label}</strong>
                      <small>{l.note}</small>
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
        <div className="et-public-actions">
          <CartButton />
          <button type="button" className="et-icon-btn" onClick={() => writeTheme(!light)} aria-label={light ? "Switch to dark mode" : "Switch to light mode"}>
            {light ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <Link href="/login" className="et-btn et-btn-ghost et-btn-sm et-public-login">
            Log in
          </Link>
          <Link href="/signup" className="et-btn et-btn-primary et-public-start">
            Start learning <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="et-icon-btn et-public-burger"
            ref={menuButton}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="et-public-menu"
            onClick={() => {
              setMega(false);
              setOpen(!open);
            }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {open && (
          <nav id="et-public-menu" className="et-public-menu" aria-label="Menu" onBlur={(e) => {
            if (!header.current?.contains(e.relatedTarget)) setOpen(false);
          }}>
            <HeaderSearch mobile />
            <span className="et-public-menu-label">Menu</span>
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} onClick={closeAll}>
                {l.label} <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ))}
            {MEGA.map((col) => (
              <Fragment key={col.title}>
                <span className="et-public-menu-label">{col.title}</span>
                {col.links.map((l) => (
                  <Link key={l.href} href={l.href} onClick={closeAll}>
                    {l.label} <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                ))}
              </Fragment>
            ))}
            <Link href="/login" onClick={closeAll}>
              Log in <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </nav>
        )}
        </div>
      </header>
      <main className="et-public-main">{children}</main>
      <footer className="et-public-foot">
        <div className="et-public-foot-cols">
          <div className="et-public-foot-brand">
            <BrandLogo className="et-brand-logo" />
            <p>{brand.tagline}</p>
          </div>
          {FOOTER.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <b>{col.title}</b>
              {col.links.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className="et-public-foot-base">
          <span>© {brand.year} {brand.name}</span>
          {footerLinks}
        </div>
      </footer>
    </div>
  );
}

type NavProps = {
  pathname?: string;
  mega: boolean;
  megaButton: React.RefObject<HTMLButtonElement | null>;
  onMega: (e: React.MouseEvent) => void;
  hover: { onPointerEnter: (e: React.PointerEvent) => void; onPointerLeave: (e: React.PointerEvent) => void };
  onPointerType: (type: string) => void;
  onNavigate: () => void;
};

function NavLinks({ pathname, mega, megaButton, onMega, hover, onPointerType, onNavigate }: NavProps) {
  return (
    <>
      {NAV.map((l) => {
        const active = !!pathname && (l.href === "/" ? pathname === "/" : pathname === l.href || pathname.startsWith(`${l.href}/`));
        return (
          <Link key={l.href} href={l.href} className={`et-public-link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined} onClick={onNavigate}>
            {l.label}
          </Link>
        );
      })}
      <button type="button" ref={megaButton} className={`et-public-link et-public-mega-btn${mega ? " is-open" : ""}`} aria-expanded={mega} aria-controls="et-mega" onClick={onMega} onPointerDown={(e) => onPointerType(e.pointerType)} {...hover}>
        Menu <ChevronDown size={15} aria-hidden="true" />
      </button>
    </>
  );
}

function ActiveNavLinks(props: Omit<NavProps, "pathname">) {
  return <NavLinks pathname={usePathname()} {...props} />;
}

function HeaderSearch({ mobile = false }: { mobile?: boolean }) {
  return (
    <form action="/courses" role="search" aria-label="Search courses" className={`et-public-search${mobile ? " is-mobile" : ""}`}>
      <Search size={16} aria-hidden="true" />
      <input type="search" name="q" placeholder="What do you want to learn?" aria-label="Search courses" />
      <button type="submit" aria-label="Search"><ArrowRight size={15} aria-hidden="true" /></button>
    </form>
  );
}
