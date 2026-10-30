"use client";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useEffect, useState } from "react";
import { OPEN_AI } from "./AiWidget";
import { AiAvatar } from "@/components/learn/AiAvatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Plus, BookOpen, ChevronLeft, Compass, House, Inbox, UserRound, type LucideIcon } from "lucide-react";
import { Avatar as PhotoAvatar } from "@/components/dash/Avatar";
import type { FeatureMap } from "@/lib/features";
import "./mobile-app.css";

// The phone app (under 860px): a slim top bar, a big title with section switches on the main screens, and five tabs
// at the bottom. No sidebar. Desktop keeps the sidebar layout; Shell renders both and CSS shows the right one.

type Tab = { label: string; href: string; icon: LucideIcon; match: (p: string) => boolean };
type Segment = { label: string; href: string; match: (p: string) => boolean };
type Section = { title: string; match: (p: string) => boolean; segments?: Segment[] };

const starts = (p: string, ...prefixes: string[]) => prefixes.some((x) => p === x || p.startsWith(`${x}/`));

const learnTabs: Tab[] = [
  { label: "Home", href: "/learn", icon: House, match: (p) => p === "/learn" },
  { label: "Learn", href: "/learn/courses", icon: BookOpen, match: (p) => starts(p, "/learn/courses", "/learn/saved") },
  { label: "Browse", href: "/learn/browse", icon: Compass, match: (p) => starts(p, "/learn/browse") },
  { label: "News", href: "/learn/announcements", icon: Inbox, match: (p) => starts(p, "/learn/announcements") },
  { label: "Me", href: "/me", icon: UserRound, match: (p) => starts(p, "/me", "/profile", "/settings", "/support") },
];

const sections: Section[] = [
  {
    title: "Learn",
    match: (p) => ["/learn/courses", "/learn/saved"].includes(p),
    segments: [
      { label: "My courses", href: "/learn/courses", match: (p) => p === "/learn/courses" },
      { label: "Saved", href: "/learn/saved", match: (p) => p === "/learn/saved" },
    ],
  },
];

// Screens a tab opens (no back arrow). Everything else is a pushed screen with a back arrow.
const rootPaths = ["/learn", "/me", "/learn/courses", "/learn/browse", "/learn/saved", "/learn/announcements"];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function mobileTabs(_: { features: Partial<FeatureMap> }) {
  return learnTabs;
}

// The phone's floating + button, above the tab bar. Opens the AI assistant.
export function MobileFab({ features }: { pathname: string; features: Partial<FeatureMap> }) {
  const [open, setOpen] = useState(false);
  const ai = features.ai_assistant !== false;
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open]);
  if (!ai) return null;

  const askAi = () => {
    setOpen(false);
    window.dispatchEvent(new Event(OPEN_AI));
  };

  return (
    <>
      {open && <div className="et-mfab-scrim" onClick={() => setOpen(false)} aria-hidden />}
      <div className={`et-mfab${open ? " is-open" : ""}`}>
        {open && (
          <div className="et-mfab-menu" role="menu">
            <button type="button" role="menuitem" onClick={askAi}>
              <span>Ask AI</span>
              <i className="is-ai">
                <AiAvatar size={30} />
              </i>
            </button>
          </div>
        )}
        <button type="button" className="et-mfab-btn" onClick={() => setOpen(!open)} aria-label={open ? "Close" : "Create"} aria-expanded={open}>
          <Plus size={26} strokeWidth={2.4} />
        </button>
      </div>
    </>
  );
}

export function MobileTabBar({ pathname, tabs }: { pathname: string; tabs: Tab[] }) {
  return (
    <div className="et-mdock">
    <nav className="et-mtabs" aria-label="Main" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      {tabs.map(({ label, href, icon: Icon, match }) => {
        const on = match(pathname);
        return (
          <Link key={label} href={href} className={on ? "is-active" : undefined} aria-current={on ? "page" : undefined} data-tour={href}>
            <Icon size={23} strokeWidth={on ? 2.2 : 1.7} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
    </div>
  );
}

// Top bar: back arrow on pushed screens, a small title that fades in once the big title scrolls away, and on Home the
// logo with Inbox and your photo.
export function MobileTopBar({
  pathname,
  tabs,
  user,
}: {
  pathname: string;
  tabs: Tab[];
  user: { name: string; avatarUrl: string | null; initial: string };
  features: Partial<FeatureMap>;
}) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [title, setTitle] = useState("");
  const home = pathname === "/learn";
  const root = rootPaths.includes(pathname);
  const section = sections.find((s) => s.match(pathname));

  useEffect(() => {
    const main = document.querySelector(".et-main");
    if (!main) return;
    const onScroll = () => setScrolled(main.scrollTop > 56);
    onScroll();
    main.addEventListener("scroll", onScroll, { passive: true });
    // The screen's own heading becomes the small title. Watched, because the new page can render after this runs.
    const read = () => {
      setTitle(section?.title ?? main.querySelector(":is(.et-page-head,.et-tab-head) h1")?.textContent ?? "");
      // A tab strip wider than the screen scrolls; bring the open tab into view so the strip shows where you are.
      // Only the strip moves sideways; the page itself stays put.
      const on = main.querySelector<HTMLElement>(":is(.et-seg,.et-mseg) .is-on");
      const strip = on?.parentElement;
      if (on && strip) strip.scrollLeft += on.getBoundingClientRect().left - strip.getBoundingClientRect().left - (strip.clientWidth - on.offsetWidth) / 2;
    };
    read();
    const watch = new MutationObserver(read);
    watch.observe(main, { childList: true, subtree: true });
    const stop = setTimeout(() => watch.disconnect(), 4000);
    return () => {
      main.removeEventListener("scroll", onScroll);
      watch.disconnect();
      clearTimeout(stop);
    };
  }, [pathname, section?.title]);

  const back = () => {
    if (window.history.length > 1) router.back();
    else router.push(tabs.find((t) => t.match(pathname))?.href ?? tabs[0].href);
  };

  return (
    <header className={`et-mtop${scrolled ? " is-scrolled" : ""}`}>
      <div className="et-mtop-side">
        {home ? (
          <BrandLogo className="et-mtop-logo" />
        ) : !root ? (
          <button type="button" className="et-mtop-back" onClick={back} aria-label="Back">
            <ChevronLeft size={26} strokeWidth={2.2} />
          </button>
        ) : null}
      </div>
      <b className={`et-mtop-title${scrolled || (!root && !home) ? " is-on" : ""}`}>{home ? "" : title}</b>
      <div className="et-mtop-side is-right">
        {home && (
          <>
            <Link href={tabs.find((t) => t.label === "Inbox")?.href ?? "/learn/announcements"} className="et-mtop-icon" aria-label="Inbox">
              <Bell size={21} />
            </Link>
            <Link href="/me" className="et-mtop-me" aria-label="Me">
              <PhotoAvatar src={user.avatarUrl} initial={user.initial} seed={user.name} className="et-mtop-avatar" />
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

// Big title and section switches at the top of a tab's main screens.
export function MobileSection({ pathname }: { pathname: string; features: Partial<FeatureMap> }) {
  const section = sections.find((s) => s.match(pathname));
  if (!section) return null;
  return (
    <div className="et-msection">
      <h1>{section.title}</h1>
      {section.segments && (
        <nav className="et-mseg" aria-label={section.title}>
          {section.segments.map((s) => (
            <Link key={s.href} href={s.href} className={s.match(pathname) ? "is-on" : undefined} replace>
              {s.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
