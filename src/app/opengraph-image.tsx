import { ImageResponse } from "next/og";
import { getBrand } from "@/lib/brand";
import { siteHost } from "@/lib/email/site";

export const alt = "Online courses with certificates you can share";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The default share card (WhatsApp, X, LinkedIn previews) for pages without their own cover image, in the school's
// name and brand color.
export default async function Image() {
  const brand = await getBrand();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#070b14", color: "#f1f5fb", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: brand.accent, letterSpacing: -1 }}>{brand.name}</div>
          <div style={{ display: "flex", fontSize: 26, color: "#8a94a8" }}>{siteHost()}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>Learn new skills.</div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05, color: brand.accent }}>Earn your certificate.</div>
          <div style={{ display: "flex", fontSize: 30, color: "#8a94a8", marginTop: 8 }}>{brand.tagline}</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {["Courses", "Quizzes", "Certificates"].map((t) => (
            <div key={t} style={{ display: "flex", padding: "12px 22px", borderRadius: 999, background: brand.accent, color: brand.accentFg, fontSize: 24, fontWeight: 600 }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
