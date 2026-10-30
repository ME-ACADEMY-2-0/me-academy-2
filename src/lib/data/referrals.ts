import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Referrals: sign-up linking and the friend's welcome coupon happen in the database (handle_new_user). This pays
// the referrer once the friend's first paid order completes: a one-time coupon locked to the referrer's email.
export async function rewardReferrer(userId: string, paidMinor: number) {
  if (paidMinor <= 0) return;
  const db = createAdminClient();
  const [{ data: ref }, { data: s }] = await Promise.all([
    db.from("referrals").select("id, referrer_id").eq("referred_id", userId).eq("status", "joined").maybeSingle(),
    db.from("platform_settings").select("referrals_enabled, referral_reward_percent").eq("id", true).maybeSingle(),
  ]);
  if (!ref || !s?.referrals_enabled || s.referral_reward_percent <= 0) return;

  // Claim the referral first so two webhooks for the same order can't both pay out.
  const { data: claimed } = await db
    .from("referrals")
    .update({ status: "rewarded", rewarded_at: new Date().toISOString() })
    .eq("id", ref.id)
    .eq("status", "joined")
    .select("id")
    .maybeSingle();
  if (!claimed) return;

  const { data: referrer } = await db.auth.admin.getUserById(ref.referrer_id);
  const email = referrer.user?.email?.toLowerCase();
  if (!email) return;
  const code = `THANKS-${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
  const { data: coupon } = await db
    .from("coupons")
    .insert({ code, description: "Referral reward", kind: "percent", value: s.referral_reward_percent, emails: [email], max_uses: 1, per_person: 1 })
    .select("id")
    .single();
  if (!coupon) return;
  await Promise.all([
    db.from("referrals").update({ reward_coupon_id: coupon.id }).eq("id", ref.id),
    db.from("notifications").insert({
      user_id: ref.referrer_id,
      kind: "referral",
      title: "You earned a referral reward",
      body: `A friend you invited bought their first course. Use ${code} for ${s.referral_reward_percent}% off your next course.`,
      href: "/settings/referrals",
    }),
  ]);
}
