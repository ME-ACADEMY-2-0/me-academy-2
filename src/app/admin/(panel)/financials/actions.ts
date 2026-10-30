"use server";
import { refresh } from "next/cache";
import { renewAccess } from "@/lib/data/access";
import { audit, requireAdmin } from "@/lib/admin";
import { nairaToMinor } from "@/lib/format";
import type { FormState } from "@/lib/form-state";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

// Manual / offline payment (bank transfer etc.): records the sale and enrolls the buyer.
export async function recordPayment(_prev: FormState, fd: FormData): Promise<FormState> {
  const { admin, db } = await requireAdmin("financials");
  const email = str(fd, "email").toLowerCase();
  const courseId = str(fd, "course_id");
  if (!email || !courseId) return { error: "Enter the buyer's email and pick a course." };

  const { data: matches } = await db.rpc("admin_list_users", { p_search: email, p_limit: 5 });
  const buyer = (matches ?? []).find((u) => u.email.toLowerCase() === email);
  if (!buyer) return { error: "No account uses that email." };

  const { data: course } = await db.from("courses").select("id, title, instructor_id, price_minor, currency").eq("id", courseId).single();
  if (!course) return { error: "Course not found." };
  const amount = str(fd, "amount") ? nairaToMinor(str(fd, "amount")) : course.price_minor;
  if (amount <= 0) return { error: "Enter an amount above zero." };

  const reference = str(fd, "reference") || `MAN-${Date.now().toString(36).toUpperCase()}`;
  const { error } = await db.from("payments").insert({
    user_id: buyer.id,
    course_id: course.id,
    instructor_id: course.instructor_id,
    amount_minor: amount,
    currency: course.currency,
    provider: "manual",
    reference,
    status: "success",
    note: str(fd, "note") || null,
    paid_at: new Date().toISOString(),
  });
  if (error) return { error: error.code === "23505" ? "That reference is already used." : "Could not record the payment." };
  await db.from("enrollments").upsert({ user_id: buyer.id, course_id: course.id }, { onConflict: "user_id,course_id", ignoreDuplicates: true });
  await renewAccess(buyer.id, [course.id]);
  await audit(admin.id, "payment.manual", { type: "payment", id: reference }, { amount, course_id: course.id, user_id: buyer.id });
  refresh();
  return { ok: `Recorded ${reference} and enrolled ${buyer.full_name || email}.` };
}

export async function refundPayment(fd: FormData) {
  const { admin, db } = await requireAdmin("financials");
  const id = str(fd, "id");
  const { data: p } = await db.from("payments").select("user_id, course_id, status").eq("id", id).single();
  if (!p || p.status !== "success") return;
  await db.from("payments").update({ status: "refunded" }).eq("id", id);
  if (fd.get("revoke") === "on" && p.user_id && p.course_id) {
    await db.from("enrollments").delete().eq("user_id", p.user_id).eq("course_id", p.course_id);
  }
  await audit(admin.id, "payment.refund", { type: "payment", id });
  refresh();
}
