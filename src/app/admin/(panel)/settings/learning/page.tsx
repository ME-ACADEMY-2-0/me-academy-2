import { redirect } from "next/navigation";
import { ActionForm, SubmitButton } from "@/components/dash/ActionForm";
import { requireAdmin } from "@/lib/admin";
import { saveLearningSettings } from "../actions";

export const metadata = { title: "Learning settings" };

export default async function LearningSettings() {
  const { admin, db } = await requireAdmin("settings");
  if (!admin.isSuper) redirect("/admin/settings");
  const { data: s } = await db.from("platform_settings").select("certificate_signer_name, certificate_signer_title, referrals_enabled, referral_friend_percent, referral_reward_percent").single();

  return (
    <ActionForm action={saveLearningSettings} toast className="et-page">
      <section className="et-card">
        <div className="et-card-head">
          <h2>Certificates</h2>
          <span className="et-muted" style={{ fontSize: 12.5 }}>
            Signature on certificates for courses without an instructor
          </span>
        </div>
        <div className="et-card-pad et-form-grid">
          <div className="et-field">
            <label htmlFor="certificate_signer_name">Signed by</label>
            <input id="certificate_signer_name" name="certificate_signer_name" defaultValue={s?.certificate_signer_name ?? ""} placeholder="The school team" maxLength={80} />
          </div>
          <div className="et-field">
            <label htmlFor="certificate_signer_title">Title</label>
            <input id="certificate_signer_title" name="certificate_signer_title" defaultValue={s?.certificate_signer_title ?? ""} placeholder="Your school name" maxLength={80} />
          </div>
          <small className="et-field-wide et-muted" style={{ fontSize: 12 }}>
            Courses with an instructor are signed by the instructor. Leave these empty to use your school name from Branding.
          </small>
        </div>
      </section>

      <section className="et-card">
        <div className="et-card-head">
          <h2>Referrals</h2>
          <span className="et-muted" style={{ fontSize: 12.5 }}>
            Learners share a link from Settings &gt; Refer a friend. Rewards are one-time coupons, listed in Coupons.
          </span>
        </div>
        <div className="et-card-pad et-form-grid">
          <label className="et-field-wide et-inline" style={{ gap: 8 }}>
            <input type="checkbox" name="referrals_enabled" defaultChecked={s?.referrals_enabled ?? true} />
            Referrals are on
          </label>
          <div className="et-field">
            <label htmlFor="referral_friend_percent">Friend&apos;s discount on their first course (%)</label>
            <input id="referral_friend_percent" name="referral_friend_percent" type="number" min={0} max={100} defaultValue={s?.referral_friend_percent ?? 10} />
          </div>
          <div className="et-field">
            <label htmlFor="referral_reward_percent">Referrer&apos;s reward after the friend&apos;s first purchase (%)</label>
            <input id="referral_reward_percent" name="referral_reward_percent" type="number" min={0} max={100} defaultValue={s?.referral_reward_percent ?? 10} />
          </div>
        </div>
      </section>

      <div className="et-form-foot">
        <SubmitButton>Save learning settings</SubmitButton>
      </div>
    </ActionForm>
  );
}
