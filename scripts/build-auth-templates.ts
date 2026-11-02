// Rebuilds supabase/templates/*.html from src/lib/email/templates.ts. Then apply them with configure-auth-email.mjs.
// Brand values come from the environment (the live app also does this itself: Admin > Emails > Update sign-in emails).
//   BRAND_NAME="Acme Academy" BRAND_COLOR="#7c3aed" BRAND_LOGO_URL="https://.../logo.png" npx tsx scripts/build-auth-templates.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { AUTH_EMAILS, authEmail } from "../src/lib/email/templates";
import { authLink } from "../src/lib/email/auth-links";
import { brandify } from "../src/lib/email/brand-tokens";

const brand = {
  name: process.env.BRAND_NAME || "ME Academy",
  logoUrl: process.env.BRAND_LOGO_URL || null,
  accent: process.env.BRAND_COLOR || "#2563eb",
  accentFg: process.env.BRAND_COLOR_TEXT || "#ffffff",
};

const dir = new URL("../supabase/templates/", import.meta.url);
mkdirSync(dir, { recursive: true });
const subjects: Record<string, string> = {};
for (const kind of AUTH_EMAILS) {
  const e = authEmail(kind, { url: authLink(kind), email: "{{ .Email }}", newEmail: "{{ .NewEmail }}" });
  writeFileSync(new URL(`${kind}.html`, dir), `${brandify(e.html, brand)}\n`);
  subjects[kind] = brandify(e.subject, brand, "text");
}
writeFileSync(new URL("subjects.json", dir), `${JSON.stringify(subjects, null, 2)}\n`);
console.log(`Wrote ${AUTH_EMAILS.length} templates.`);
