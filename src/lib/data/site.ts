import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Public marketing-page reads (About). Service role, but only counts.
export async function getSiteStats() {
  const db = createAdminClient();
  const head = { count: "exact" as const, head: true };
  const [courses, instructors, learners, certificates] = await Promise.all([
    db.from("courses").select("id", head).eq("status", "published"),
    db.from("user_roles").select("user_id", head).eq("role", "tutor"),
    db.from("profiles").select("id", head).is("deleted_at", null),
    db.from("certificates").select("id", head),
  ]);
  return {
    courses: courses.count ?? 0,
    instructors: instructors.count ?? 0,
    learners: learners.count ?? 0,
    certificates: certificates.count ?? 0,
  };
}
