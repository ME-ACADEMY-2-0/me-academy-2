import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";
import type { PickItem } from "./CouponForm";

// Published courses, for the "Chosen items" picker on the coupon form.
export async function pickableItems(): Promise<PickItem[]> {
  const db = createAdminClient();
  const { data: courses } = await db.from("courses").select("id, title, price_minor, currency").eq("status", "published").order("title");
  return [
    ...(courses ?? []).map((c) => ({ id: c.id, title: c.title, type: "course" as const, meta: `Course · ${c.price_minor ? formatPrice(c.price_minor, c.currency) : "Free"}` })),
  ];
}
