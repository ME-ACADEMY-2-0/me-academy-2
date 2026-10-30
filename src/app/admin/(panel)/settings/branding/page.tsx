import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { BRAND_DEFAULTS, FONTS, type FontKey } from "@/lib/brand-shared";
import { BrandingForm } from "./BrandingForm";

export const metadata = { title: "Branding" };

// The school's name, logos, colors, font and default theme. Every page reads these (lib/brand.ts).
export default async function BrandingSettings() {
  const { admin, db } = await requireAdmin("settings");
  if (!admin.isSuper) redirect("/admin/settings");
  const { data: s } = await db
    .from("platform_settings")
    .select("site_name, tagline, logo_url, logo_dark_url, icon_url, accent_color, accent_fg, theme_default, font, email_from_name")
    .single();
  return (
    <BrandingForm
      initial={{
        name: s?.site_name ?? BRAND_DEFAULTS.name,
        tagline: s?.tagline ?? "",
        emailFromName: s?.email_from_name ?? "",
        logoUrl: s?.logo_url ?? null,
        logoDarkUrl: s?.logo_dark_url ?? null,
        iconUrl: s?.icon_url ?? null,
        accent: s?.accent_color ?? BRAND_DEFAULTS.accent,
        accentFg: s?.accent_fg ?? BRAND_DEFAULTS.accentFg,
        themeDefault: s?.theme_default === "dark" ? "dark" : "light",
        font: ((s?.font as FontKey) in FONTS ? s?.font : "geist") as FontKey,
      }}
    />
  );
}
