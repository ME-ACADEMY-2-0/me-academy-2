import Link from "next/link";
import { Award, Bell, ChevronRight, CreditCard, Heart, LifeBuoy, Megaphone, Settings, ShieldCheck, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/dash/Avatar";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_LABELS, isStaff, primaryRole } from "@/lib/roles";
import { DarkModeRow, SignOutRow } from "./MeRows";
import "./me.css";

export const metadata = { title: "Me" };

type Row = { label: string; href: string; icon: LucideIcon; hint?: string };

// The phone app's Me tab: your profile, then everything that lived in the sidebar, grouped like an iOS settings list.
export default async function MePage() {
  const user = await getCurrentUser();
  const display = user.name || user.email;

  const learning: Row[] = [
    { label: "Announcements", href: "/learn/announcements", icon: Megaphone },
    { label: "Saved", href: "/learn/saved", icon: Heart },
    { label: "Certificates", href: "/profile/certificates", icon: Award },
  ];
  const account: Row[] = [
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Notifications", href: "/settings/notifications", icon: Bell },
    { label: "Billing", href: "/settings/billing", icon: CreditCard },
    { label: "Help and support", href: "/support", icon: LifeBuoy },
    ...(isStaff(user.roles) ? [{ label: "Admin dashboard", href: "/admin", icon: ShieldCheck }] : []),
  ];

  return (
    <div className="et-page et-me">
      <Link href="/profile" className="et-me-card">
        <Avatar src={user.avatarUrl} initial={display.charAt(0).toUpperCase()} seed={display} className="et-me-avatar" />
        <span className="et-me-who">
          <b>{user.name || "Your account"}</b>
          <small>{user.email}</small>
          <em>{ROLE_LABELS[primaryRole(user.roles)]}</em>
        </span>
        <ChevronRight size={18} />
      </Link>

      <Group title="Learning" rows={learning} />
      <Group title="Account" rows={account}>
        <DarkModeRow />
      </Group>
      <div className="et-me-group">
        <SignOutRow />
      </div>
    </div>
  );
}

function Group({ title, rows, children }: { title: string; rows: Row[]; children?: React.ReactNode }) {
  return (
    <section>
      <p className="et-me-title">{title}</p>
      <div className="et-me-group">
        {rows.map(({ label, href, icon: Icon, hint }) => (
          <Link key={href + label} href={href} className="et-me-row">
            <span className="et-me-ico">
              <Icon size={17} />
            </span>
            <span className="et-me-label">{label}</span>
            {hint && <small>{hint}</small>}
            <ChevronRight size={16} className="et-me-chev" />
          </Link>
        ))}
        {children}
      </div>
    </section>
  );
}
