import type { MetadataRoute } from "next";
import { getBrand } from "@/lib/brand";

// The installable app's name, colors and icons, from Admin > Settings > Branding. Served at /manifest.webmanifest.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const brand = await getBrand();
  const icons: MetadataRoute.Manifest["icons"] = brand.iconUrl
    ? [{ src: brand.iconUrl, sizes: "512x512", purpose: "any" }]
    : [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ];
  return {
    id: "/",
    name: brand.name,
    short_name: brand.name.slice(0, 12),
    description: brand.tagline,
    start_url: "/welcome?source=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: brand.accent,
    theme_color: brand.accent,
    categories: ["education"],
    icons,
    shortcuts: [{ name: "My courses", url: "/learn/courses" }],
  };
}
