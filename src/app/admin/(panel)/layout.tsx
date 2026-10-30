import { Suspense } from "react";
import type { Metadata } from "next";
import Shell from "@/components/shell/Shell";
import { requireAdmin } from "@/lib/admin";
import { canAccess } from "@/lib/roles";
import "@/app/(app)/app.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="et-app is-light" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  const { admin, db } = await requireAdmin();
  const { count: chats } = admin.isSuper
    ? await db.from("support_threads").select("id", { count: "exact", head: true }).eq("staff_unread", true).neq("status", "closed")
    : { count: 0 };
  const { count: reviews } = canAccess(admin.roles, "courses")
    ? await db.from("course_reviews").select("id", { count: "exact", head: true }).eq("approved", false)
    : { count: 0 };
  const { count: comments } = canAccess(admin.roles, "blog")
    ? await db.from("blog_comments").select("id", { count: "exact", head: true }).eq("approved", false)
    : { count: 0 };

  return (
    <Shell
      mode="admin"
      badges={{ chats: chats ?? 0, comments: comments ?? 0, reviews: reviews ?? 0 }}
      user={{ id: admin.id, name: admin.name, email: admin.email, roles: admin.roles, avatarUrl: admin.avatarUrl }}
    >
      {children}
    </Shell>
  );
}
