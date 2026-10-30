import "server-only";
import { activeAccess } from "@/lib/access";
import { renewAccess } from "@/lib/data/access";
import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordRedemption } from "./coupons";
import { emailGuestAccess, emailOrderReceipt } from "@/lib/email/notify";
import { accountForGuest, maskEmail } from "./guest";
import { initializeTransaction, type VerifiedTransaction } from "@/lib/paystack";
import { siteUrl } from "@/lib/email/site";

// Cart checkout. The buyer's courses become one order with one Paystack payment; each course is also a row in
// payments. Nothing is granted until Paystack itself confirms the charge (callback or
// webhook, whichever comes first) and the amount and currency match the order.

export type CartRef = { type: "course"; id: string };
export type PricedItem = CartRef & {
  slug: string;
  title: string;
  kind: string;
  priceMinor: number;
  currency: string;
  coverUrl: string | null;
  href: string;
  // Why it can't be bought right now, if it can't.
  problem: "unavailable" | "free" | "owned" | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const MAX_CART = 20;

// Current price and availability for each cart item, read fresh from the database (the browser's copy of the cart
// is only a list of ids). `ownerId` marks items that account already has.
export async function priceItems(refs: CartRef[], ownerId: string | null): Promise<PricedItem[]> {
  const seen = new Set<string>();
  const clean = refs
    .filter((r) => r.type === "course" && UUID.test(r.id))
    .filter((r) => !seen.has(r.id) && !!seen.add(r.id))
    .slice(0, MAX_CART);
  const ids = clean.map((r) => r.id);
  const db = createAdminClient();
  const [{ data: courses }, { data: enrolled }] = await Promise.all([
    ids.length ? db.from("courses").select("id, slug, title, price_minor, currency, status, cover_url").in("id", ids) : Promise.resolve({ data: [] }),
    ownerId && ids.length ? db.from("enrollments").select("course_id").eq("user_id", ownerId).in("course_id", ids).or(activeAccess()) : Promise.resolve({ data: [] }),
  ]);
  const owned = new Set((enrolled ?? []).map((e) => e.course_id));
  return clean.map((r): PricedItem => {
    const c = (courses ?? []).find((x) => x.id === r.id);
    if (!c) return { ...r, slug: "", title: "This course is no longer available", kind: "course", priceMinor: 0, currency: "NGN", coverUrl: null, href: "/courses", problem: "unavailable" };
    return {
      ...r,
      slug: c.slug,
      title: c.title,
      kind: "course",
      priceMinor: c.price_minor,
      currency: c.currency,
      coverUrl: c.cover_url,
      href: `/courses/${c.slug}`,
      problem: c.status !== "published" ? "unavailable" : c.price_minor <= 0 ? "free" : owned.has(r.id) ? "owned" : null,
    };
  });
}

export type Billing = { firstName: string; lastName: string; email: string; phone: string; country: string; state: string };

// Records a pending order and one pending payment row per item. Items must already be checked (no `problem`).
// `coupon` takes its per-item discounts off first (each item is recorded at what the buyer pays for it).
export async function createOrder(
  userId: string | null,
  billing: Billing,
  items: PricedItem[],
  { coupon = null }: { coupon?: { id: string; discounts: number[] } | null } = {},
) {
  const db = createAdminClient();
  const reference = `SC${randomUUID().replace(/-/g, "").slice(0, 20).toUpperCase()}`;
  const discounts = items.map((_, i) => coupon?.discounts[i] ?? 0);
  const paid = items.map((item, i) => ({ ...item, priceMinor: item.priceMinor - discounts[i] }));
  const discountMinor = discounts.reduce((n, d) => n + d, 0);
  const total = paid.reduce((n, i) => n + i.priceMinor, 0);
  const { data: order, error } = await db
    .from("orders")
    .insert({
      reference,
      user_id: userId,
      email: billing.email,
      first_name: billing.firstName,
      last_name: billing.lastName,
      phone: billing.phone || null,
      country: billing.country || null,
      state: billing.state || null,
      total_minor: total,
      currency: items[0]?.currency ?? "NGN",
      coupon_id: coupon && discountMinor > 0 ? coupon.id : null,
      discount_minor: discountMinor,
    })
    .select("id, reference, total_minor, currency")
    .single();
  if (error || !order) return null;
  const { error: itemsError } = await db.from("payments").insert(
    paid.map((item, i) => ({
      order_id: order.id,
      user_id: userId,
      course_id: item.id,
      amount_minor: item.priceMinor,
      discount_minor: discounts[i],
      currency: item.currency,
      provider: "paystack",
      reference: `${reference}-${i + 1}`,
      status: "pending" as const,
    })),
  );
  if (itemsError) {
    await db.from("orders").delete().eq("id", order.id);
    return null;
  }
  return order;
}

// Marks a verified Paystack charge as paid and grants every item. Safe to call more than once: only the call that
// flips the order from pending (or failed) to success does anything.
export async function fulfillOrder(tx: VerifiedTransaction): Promise<{ ok: boolean; destination?: string; reason?: string }> {
  const db = createAdminClient();
  const { data: order } = await db
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("reference", tx.reference)
    .maybeSingle();
  if (!order) return { ok: false, reason: "unknown reference" };
  // Guests aren't signed in when they come back from Paystack, so the page tells them which inbox to check.
  const destination = `/checkout/complete?order=${order.reference}${order.user_id ? "" : `&email=${encodeURIComponent(maskEmail(order.email))}`}`;
  if (order.status === "success") return { ok: true, destination };
  if (tx.status !== "success") {
    // Only a definite failure closes it. "abandoned" or "ongoing" may still turn into a payment.
    if (tx.status === "failed") {
      await db.from("orders").update({ status: "failed" }).eq("id", order.id).eq("status", "pending");
      await db.from("payments").update({ status: "failed" }).eq("order_id", order.id).eq("status", "pending");
    }
    return { ok: false, reason: tx.status };
  }
  if (tx.amount !== order.total_minor || tx.currency !== order.currency) {
    const note = `Amount mismatch: paid ${tx.amount} ${tx.currency}`;
    await db.from("orders").update({ status: "failed", note }).eq("id", order.id).eq("status", "pending");
    await db.from("payments").update({ status: "failed", note }).eq("order_id", order.id).eq("status", "pending");
    return { ok: false, reason: "amount mismatch" };
  }
  return completeOrder(order, tx.paid_at ?? new Date().toISOString(), destination);
}

const ORDER_COLUMNS = "id, reference, user_id, email, first_name, last_name, total_minor, currency, status, coupon_id, discount_minor";
type OrderRow = { id: string; reference: string; user_id: string | null; email: string; first_name: string; last_name: string; status: string; total_minor: number; currency: string; coupon_id: string | null; discount_minor: number };

// Orders with nothing left to charge (a coupon covers it all): nothing goes to Paystack, the order
// completes straight away. Guests can get here with a 100% coupon; their account is made in completeOrder.
export async function completeFreeOrder(orderId: string) {
  const db = createAdminClient();
  const { data: order } = await db.from("orders").select(ORDER_COLUMNS).eq("id", orderId).maybeSingle();
  if (!order || order.total_minor !== 0) return { ok: false as const };
  return completeOrder(order, new Date().toISOString(), `/checkout/complete?order=${order.reference}${order.user_id ? "" : `&email=${encodeURIComponent(maskEmail(order.email))}`}`);
}

// Marks the order paid and enrolls the buyer in every course. Only the call that flips the order
// from pending (or failed) to success does anything.
async function completeOrder(order: OrderRow, paidAt: string, destination: string): Promise<{ ok: boolean; destination?: string; reason?: string }> {
  const db = createAdminClient();
  const { data: flipped } = await db
    .from("orders")
    .update({ status: "success", paid_at: paidAt })
    .eq("id", order.id)
    // A retry on Paystack's page can succeed after an earlier attempt was recorded as failed.
    .in("status", ["pending", "failed"])
    .select("id")
    .maybeSingle();
  if (!flipped) return { ok: true, destination };

  // Guests: find or create their account now that the money is confirmed.
  let userId = order.user_id;
  let tempPassword: string | null = null;
  if (!userId) {
    const account = await accountForGuest(order.email, `${order.first_name} ${order.last_name}`.trim());
    if (!account) {
      await db.from("orders").update({ note: "Paid, but the buyer's account could not be created. Grant access by hand." }).eq("id", order.id);
      return { ok: true, destination };
    }
    userId = account.userId;
    tempPassword = account.password;
    await db.from("orders").update({ user_id: userId }).eq("id", order.id);
  }

  if (order.coupon_id) await recordRedemption({ ...order, user_id: userId });

  const { data: items } = await db
    .from("payments")
    .update({ status: "success", paid_at: paidAt, user_id: userId })
    .eq("order_id", order.id)
    .select("id, course_id");
  const courseIds = (items ?? []).flatMap((i) => (i.course_id ? [i.course_id] : []));
  if (courseIds.length) {
    await db.from("enrollments").upsert(courseIds.map((course_id) => ({ user_id: userId, course_id })), { onConflict: "user_id,course_id", ignoreDuplicates: true });
    await renewAccess(userId, courseIds);
  }
  after(() => emailOrderReceipt(order.id));
  // New accounts get their login details; buyers who already had an account just sign in as usual.
  if (tempPassword) {
    const password = tempPassword;
    after(() => emailGuestAccess(order.id, password));
  }
  return { ok: true, destination };
}

// Opens Paystack's checkout for an order. Cancelling there brings the buyer back through /checkout/cancelled,
// which sends the first reminder straight away.
export async function paystackCheckoutUrl(order: { id: string; reference: string; total_minor: number; currency: string }, billing: Billing, titles: string[]) {
  const site = siteUrl();
  const init = await initializeTransaction({
    email: billing.email,
    amountMinor: order.total_minor,
    currency: order.currency,
    reference: order.reference,
    callbackUrl: `${site}/api/paystack/callback`,
    metadata: {
      order_id: order.id,
      cancel_action: `${site}/checkout/cancelled?order=${order.reference}`,
      custom_fields: [
        { display_name: "Name", variable_name: "name", value: `${billing.firstName} ${billing.lastName}`.trim() },
        { display_name: "Phone", variable_name: "phone", value: billing.phone },
        { display_name: "Items", variable_name: "items", value: titles.join(", ").slice(0, 250) },
      ],
    },
  });
  return init.status && init.data ? init.data.authorization_url : null;
}
