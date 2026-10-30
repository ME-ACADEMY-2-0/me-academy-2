"use server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type InboxNote = { id: string; kind: string; title: string; body: string | null; href: string | null; read: boolean; at: string };
export type InboxThread = { id: string; kind: "support"; title: string; sub: string; preview: string | null; avatar: string | null; at: string; unread: number; href: string };
// unreadMessages counts unread support conversations (the header icon and the sidebar's Support link).
export type Inbox = { notes: InboxNote[]; unreadNotes: number; threads: InboxThread[]; unreadMessages: number; unreadSupport: number };

const EMPTY: Inbox = { notes: [], unreadNotes: 0, threads: [], unreadMessages: 0, unreadSupport: 0 };

// Everything the header's bell and messages menus show: the latest notifications, and the latest support chats
// with unread counts. In the admin panel (`staff`), support means the
// team's inbox: learners' open support chats, opening in Admin → Chats.
export async function getInbox(staff = false): Promise<Inbox> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EMPTY;
  const [notes, unread, { data: support }] = await Promise.all([
    supabase.from("notifications").select("id, kind, title, body, href, read_at, created_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null),
    supabase.from("support_threads").select("id, subject, last_message_at, user_unread").eq("user_id", user.id).order("last_message_at", { ascending: false }).limit(20),
  ]);
  const { data: isStaff } = staff ? await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "super_admin").maybeSingle() : { data: null };
  const { data: inbox } = isStaff
    ? await createAdminClient()
        .from("support_threads")
        .select("id, subject, last_message_at, staff_unread, user:profiles!support_threads_user_id_fkey(full_name, avatar_url)")
        .in("status", ["open", "pending"])
        .order("last_message_at", { ascending: false })
        .limit(15)
    : { data: null };
  const threads: InboxThread[] = [
    ...(inbox
      ? inbox.map((t) => ({ id: t.id, kind: "support" as const, title: t.user?.full_name || "Learner", sub: t.subject, preview: null, avatar: t.user?.avatar_url ?? null, at: t.last_message_at, unread: t.staff_unread ? 1 : 0, href: `/admin/chats/${t.id}` }))
      : (support ?? []).map((t) => ({ id: t.id, kind: "support" as const, title: "Support", sub: t.subject, preview: null, avatar: null, at: t.last_message_at, unread: t.user_unread ? 1 : 0, href: `/support/${t.id}` }))),
  ].sort((a, b) => b.at.localeCompare(a.at));
  return {
    // Until the notifications table exists these come back empty rather than failing.
    notes: (notes.data ?? []).map((n) => ({ id: n.id, kind: n.kind, title: n.title, body: n.body, href: n.href, read: !!n.read_at, at: n.created_at })),
    unreadNotes: unread.count ?? 0,
    threads: threads.slice(0, 12),
    unreadMessages: threads.reduce((n, t) => n + (t.unread ? 1 : 0), 0),
    unreadSupport: threads.filter((t) => t.unread).length,
  };
}

// Marks the given notifications read, or all of them.
export async function markNotesRead(ids?: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  let q = supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  if (ids?.length) q = q.in("id", ids);
  await q;
}
