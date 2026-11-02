// Brand types and defaults, safe to import from client and server code.

export const FONTS = {
  geist: "Geist",
  inter: "Inter",
  dm_sans: "DM Sans",
  plus_jakarta: "Plus Jakarta Sans",
  manrope: "Manrope",
  poppins: "Poppins",
} as const;
export type FontKey = keyof typeof FONTS;

export type Brand = {
  name: string;
  tagline: string;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  iconUrl: string | null;
  accent: string;
  accentFg: string;
  themeDefault: "light" | "dark";
  font: FontKey;
  emailFromName: string;
};

export const BRAND_DEFAULTS: Brand = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "ME Academy",
  tagline: "Learn at your own pace and earn certificates you can share.",
  logoUrl: null,
  logoDarkUrl: null,
  iconUrl: null,
  accent: "#2563eb",
  accentFg: "#ffffff",
  themeDefault: "light",
  font: "geist",
  emailFromName: process.env.NEXT_PUBLIC_SITE_NAME || "ME Academy",
};

const HEX = /^#[0-9a-f]{6}$/i;
export const isHex = (v: string) => HEX.test(v);

// CSS variables every stylesheet reads (--brand, --brand-strong ...). Shades are mixed from the one accent color.
export function brandCss(b: Pick<Brand, "accent" | "accentFg" | "font">) {
  const a = isHex(b.accent) ? b.accent : BRAND_DEFAULTS.accent;
  const fg = isHex(b.accentFg) ? b.accentFg : BRAND_DEFAULTS.accentFg;
  return `:root{--brand:${a};--brand-fg:${fg};--brand-strong:color-mix(in srgb,${a} 82%,#000);--brand-deep:color-mix(in srgb,${a} 55%,#000);--brand-soft:color-mix(in srgb,${a} 70%,#fff);--brand-pale:color-mix(in srgb,${a} 18%,#fff);--brand-font:var(--font-${b.font.replace("_", "-")})}`;
}
