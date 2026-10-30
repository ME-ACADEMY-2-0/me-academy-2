import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { BRAND_DEFAULTS, type Brand } from "@/lib/brand-shared";

// The school's name, logo, colors and font, edited in Admin > Settings > Branding (platform_settings). Cached for
// every page and refreshed the moment an admin saves (updateTag("brand")).
export async function getBrand(): Promise<Brand> {
  "use cache";
  cacheTag("brand");
  cacheLife("days");
  const { data: s } = await createAdminClient()
    .from("platform_settings")
    .select("site_name, tagline, logo_url, logo_dark_url, icon_url, accent_color, accent_fg, theme_default, font, email_from_name")
    .maybeSingle();
  if (!s) return BRAND_DEFAULTS;
  return {
    name: s.site_name || BRAND_DEFAULTS.name,
    tagline: s.tagline || BRAND_DEFAULTS.tagline,
    logoUrl: s.logo_url,
    logoDarkUrl: s.logo_dark_url,
    iconUrl: s.icon_url,
    accent: s.accent_color,
    accentFg: s.accent_fg,
    themeDefault: s.theme_default === "dark" ? "dark" : "light",
    font: (s.font as Brand["font"]) || "geist",
    emailFromName: s.email_from_name || s.site_name || BRAND_DEFAULTS.name,
  };
}

// For "© year" lines in server components; prerendered pages can't read the clock directly.
export async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
