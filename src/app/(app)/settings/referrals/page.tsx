import { Gift, Users } from "lucide-react";
import { CopyLink } from "@/components/dash/CopyLink";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/format";
import { SetRow } from "../SetRow";

export const metadata = { title: "Refer a friend" };

export default async function ReferralSettings() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const [{ data: me }, { data: s }, { data: refs }] = await Promise.all([
    supabase.from("profiles").select("referral_code").eq("id", user.id).single(),
    supabase.from("platform_settings").select("referrals_enabled, referral_friend_percent, referral_reward_percent").eq("id", true).maybeSingle(),
    supabase
      .from("referrals")
      .select("id, referrer_id, status, created_at, rewarded_at, welcome_coupon_id, reward_coupon_id, friend:profiles!referrals_referred_id_fkey(full_name)")
      .order("created_at", { ascending: false }),
  ]);

  if (!s?.referrals_enabled || !me?.referral_code)
    return (
      <SetRow title="Refer a friend" sub="Referrals aren't open right now.">
        <p className="et-muted">Check back later.</p>
      </SetRow>
    );

  const invited = (refs ?? []).filter((r) => r.referrer_id === user.id);
  const mine = (refs ?? []).find((r) => r.referrer_id !== user.id);
  // Coupons are admin-only under RLS, so read the codes for this learner's own referrals with the service client.
  const couponIds = [...invited.map((r) => r.reward_coupon_id), mine?.welcome_coupon_id].filter((id): id is string => !!id);
  const { data: coupons } = couponIds.length
    ? await createAdminClient().from("coupons").select("id, code, value").in("id", couponIds)
    : { data: [] };
  const coupon = (id: string | null | undefined) => coupons?.find((c) => c.id === id);
  const welcome = coupon(mine?.welcome_coupon_id);
  const rewards = invited.flatMap((r) => (coupon(r.reward_coupon_id) ? [{ ...coupon(r.reward_coupon_id)!, at: r.rewarded_at }] : []));

  return (
    <>
      <SetRow
        title="Your referral link"
        sub={`Friends who sign up with your link get ${s.referral_friend_percent}% off their first course. When they buy one, you get ${s.referral_reward_percent}% off your next.`}
      >
        <div className="et-set-box">
          <div className="et-set-box-row">
            <span className="et-set-item">
              <span className="et-set-icon">
                <Gift size={17} />
              </span>
              <span>
                <b>/r/{me.referral_code}</b>
                <small>Share it anywhere: chat, email or social media.</small>
              </span>
            </span>
            <CopyLink path={`/r/${me.referral_code}`} />
          </div>
        </div>
      </SetRow>

      <SetRow title="Friends you invited" sub={`${invited.length} joined, ${rewards.length} bought a course.`}>
        <div className="et-set-box">
          {invited.length === 0 && <div className="et-set-box-row et-muted">No one has joined with your link yet.</div>}
          {invited.map((r) => (
            <div key={r.id} className="et-set-box-row">
              <span className="et-set-item">
                <span className="et-set-icon">
                  <Users size={17} />
                </span>
                <span>
                  <b>{r.friend?.full_name || "A friend"}</b>
                  <small>Joined {formatDate(r.created_at)}</small>
                </span>
              </span>
              <span className="et-tag">{r.status === "rewarded" ? "Bought a course" : "Joined"}</span>
            </div>
          ))}
        </div>
      </SetRow>

      {(rewards.length > 0 || welcome) && (
        <SetRow title="Your codes" sub="Enter a code at checkout. Each works once, on your account only.">
          <div className="et-set-box">
            {welcome && (
              <div className="et-set-box-row">
                <span className="et-set-item">
                  <span>
                    <b>{welcome.code}</b>
                    <small>Welcome gift: {welcome.value}% off</small>
                  </span>
                </span>
              </div>
            )}
            {rewards.map((c) => (
              <div key={c.id} className="et-set-box-row">
                <span className="et-set-item">
                  <span>
                    <b>{c.code}</b>
                    <small>
                      Referral reward: {c.value}% off{c.at ? `, earned ${formatDate(c.at)}` : ""}
                    </small>
                  </span>
                </span>
              </div>
            ))}
          </div>
        </SetRow>
      )}
    </>
  );
}
