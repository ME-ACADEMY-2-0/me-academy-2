import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";

export type QuizStats = { taken: number; average: number; highest: number; lowest: number; passed: number };
export type QuizToDo = { id: string; title: string; courseId: string; courseTitle: string; questions: number; passMark: number };

// Scores across every quiz this learner has attempted, using their best attempt at each.
export async function getQuizStats(): Promise<QuizStats> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data } = await supabase.from("quiz_attempts").select("quiz_id, score, passed").eq("user_id", user.id);
  const best = new Map<string, { score: number; passed: boolean }>();
  for (const a of data ?? []) {
    const b = best.get(a.quiz_id);
    if (!b || a.score > b.score) best.set(a.quiz_id, { score: a.score, passed: b?.passed || a.passed });
  }
  const scores = [...best.values()].map((b) => b.score);
  if (!scores.length) return { taken: 0, average: 0, highest: 0, lowest: 0, passed: 0 };
  return {
    taken: scores.length,
    average: Math.round((scores.reduce((n, s) => n + s, 0) / scores.length) * 10) / 10,
    highest: Math.max(...scores),
    lowest: Math.min(...scores),
    passed: [...best.values()].filter((b) => b.passed).length,
  };
}

// Quizzes in these courses the learner hasn't passed yet, first course first.
export async function getQuizzesToDo(courses: { id: string; title: string }[]): Promise<QuizToDo[]> {
  if (!courses.length) return [];
  const user = await getCurrentUser();
  const supabase = await createClient();
  const [{ data: quizzes }, { data: passed }] = await Promise.all([
    createAdminClient()
      .from("course_quizzes")
      .select("id, title, course_id, pass_mark, created_at, questions:quiz_questions(count)")
      .in(
        "course_id",
        courses.map((c) => c.id),
      )
      .order("created_at"),
    supabase.from("quiz_attempts").select("quiz_id").eq("user_id", user.id).eq("passed", true),
  ]);
  const done = new Set((passed ?? []).map((p) => p.quiz_id));
  const order = new Map(courses.map((c, i) => [c.id, i]));
  const title = new Map(courses.map((c) => [c.id, c.title]));
  return (quizzes ?? [])
    .filter((q) => !done.has(q.id))
    .sort((a, b) => (order.get(a.course_id) ?? 0) - (order.get(b.course_id) ?? 0))
    .map((q) => ({
      id: q.id,
      title: q.title,
      courseId: q.course_id,
      courseTitle: title.get(q.course_id) ?? "",
      questions: q.questions?.[0]?.count ?? 0,
      passMark: q.pass_mark,
    }));
}
