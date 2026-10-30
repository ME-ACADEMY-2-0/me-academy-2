"use client";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useTheme, writeTheme } from "@/lib/theme";
import { CartButton } from "@/components/market/CartButton";
import { useBrand } from "@/components/brand/BrandProvider";

const NAV = [
  { href: "/courses", label: "Courses" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const FOOTER = [
  {
    title: "Learn",
    links: [
      { href: "/courses", label: "All courses" },
      { href: "/blog", label: "Blog" },
      { href: "/certificate", label: "Verify a certificate" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/about", label: "About us" },
      { href: "/help", label: "Help centre" },
      { href: "/contact", label: "Contact us" },
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
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const onOutside = (e: PointerEvent) => {
      if (!header.current?.contains(e.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1001px)");
    const onResize = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener("pointerdown", onOutside);
    desktop.addEventListener("change", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <div className={`et-app et-public${light ? " is-light" : ""}`}>
      <header className="et-public-top" ref={header}>
        <div className="et-public-top-inner">
        <Link href="/" className="et-public-brand" aria-label="Home" onClick={() => setOpen(false)}>
          <BrandLogo className="et-brand-logo" />
        </Link>
        <nav className="et-public-nav" aria-label="Main">
          {/* The current path is only known at request time, so the highlight streams in. */}
          <Suspense fallback={<NavLinks />}>
            <ActiveNavLinks />
          </Suspense>
        </nav>
        <HeaderSearch />
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
            onClick={() => setOpen(!open)}
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
            {[...NAV, { href: "/help", label: "Help centre" }, { href: "/login", label: "Log in" }].map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label} <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ))}
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

function NavLinks({ pathname }: { pathname?: string }) {
  return NAV.map((l) => {
    const active = !!pathname && (pathname === l.href || pathname.startsWith(`${l.href}/`));
    return (
      <Link key={l.href} href={l.href} className={`et-public-link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
        {l.label}
      </Link>
    );
  });
}

function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
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
