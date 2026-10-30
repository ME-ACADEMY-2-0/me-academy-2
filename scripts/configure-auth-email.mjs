// Points Supabase Auth's emails (sign-up confirmation, password reset, email change, magic link, invite) at Resend
// and installs the branded templates from supabase/templates. Run once after the client's domain is verified in
// Resend, and after scripts/build-auth-templates.ts has written the templates with their brand:
//
//   SUPABASE_PROJECT_REF=abcd... SUPABASE_ACCESS_TOKEN=sbp_... RESEND_API_KEY=re_... \
//   EMAIL_FROM_ADDRESS=support@yourschool.com EMAIL_SENDER_NAME="Your School" node scripts/configure-auth-email.mjs
import { readFileSync } from "node:fs";

const { SUPABASE_PROJECT_REF: REF, SUPABASE_ACCESS_TOKEN: token, RESEND_API_KEY: resendKey, EMAIL_FROM_ADDRESS: fromAddress, EMAIL_SENDER_NAME: senderName } = process.env;
if (!REF || !token || !resendKey || !fromAddress || !senderName) {
  console.error("Set SUPABASE_PROJECT_REF, SUPABASE_ACCESS_TOKEN, RESEND_API_KEY, EMAIL_FROM_ADDRESS and EMAIL_SENDER_NAME first.");
  process.exit(1);
}

const dir = new URL("../supabase/templates/", import.meta.url);
const tpl = (name) => readFileSync(new URL(`${name}.html`, dir), "utf8");
const subjects = JSON.parse(readFileSync(new URL("subjects.json", dir), "utf8"));

const body = {
  smtp_host: "smtp.resend.com",
  smtp_port: "465",
  smtp_user: "resend",
  smtp_pass: resendKey,
  smtp_admin_email: fromAddress,
  smtp_sender_name: senderName,
  // The built-in mailer allows ~2 an hour; with our own SMTP this can go up.
  rate_limit_email_sent: 100,
  mailer_subjects_confirmation: subjects.confirmation,
  mailer_templates_confirmation_content: tpl("confirmation"),
  mailer_subjects_recovery: subjects.recovery,
  mailer_templates_recovery_content: tpl("recovery"),
  mailer_subjects_email_change: subjects.email_change,
  mailer_templates_email_change_content: tpl("email_change"),
  mailer_subjects_magic_link: subjects.magic_link,
  mailer_templates_magic_link_content: tpl("magic_link"),
  mailer_subjects_invite: subjects.invite,
  mailer_templates_invite_content: tpl("invite"),
};

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
if (!res.ok) {
  console.error(`Supabase said ${res.status}: ${await res.text()}`);
  process.exit(1);
}
console.log(`Done. Supabase Auth now sends through Resend as ${senderName}.`);
