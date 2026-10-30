"use client";
import { useBrand } from "./BrandProvider";
import { useTheme } from "@/lib/theme";

// The school's logo from Admin > Settings > Branding, or its name as a wordmark until one is uploaded.
// `on` forces the logo for a light or dark background; by default it follows the visitor's theme.
export function BrandLogo({ className, on, alt }: { className?: string; on?: "light" | "dark"; alt?: string }) {
  const brand = useBrand();
  const { light } = useTheme();
  const dark = on ? on === "dark" : !light;
  const src = (dark && brand.logoDarkUrl) || brand.logoUrl;
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt ?? brand.name} className={className} />;
  }
  return (
    <span className={`sc-wordmark${className ? ` ${className}` : ""}`} aria-label={alt ?? brand.name}>
      {brand.name}
    </span>
  );
}

// Square icon (favicon-style). Falls back to the first letter of the name on the brand color.
export function BrandMark({ className }: { className?: string }) {
  const brand = useBrand();
  if (brand.iconUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={brand.iconUrl} alt="" className={className} />;
  }
  return (
    <span className={`sc-mark${className ? ` ${className}` : ""}`} aria-hidden>
      {brand.name.charAt(0).toUpperCase()}
    </span>
  );
}
