import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/email/site";
import { Suspense } from "react";
import { VisitTracker } from "@/components/analytics/VisitTracker";
import { RegisterServiceWorker } from "@/components/pwa/RegisterServiceWorker";
import { DialogHost } from "@/components/dash/dialogs";
import { MenuCloser } from "@/components/dash/MenuCloser";
import { BrandProvider } from "@/components/brand/BrandProvider";
import { currentYear, getBrand } from "@/lib/brand";
import { brandCss } from "@/lib/brand-shared";
import { DM_Sans, Geist, Geist_Mono, Inter, Manrope, Plus_Jakarta_Sans, Poppins } from "next/font/google";
import "./globals.css";

// Every font the admin can pick in Settings > Branding. Only the chosen one is used, so browsers only download that.
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], preload: false });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], preload: false });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-plus-jakarta", subsets: ["latin"], preload: false });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], preload: false });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], preload: false });
const FONT_VARS = [geist, geistMono, inter, dmSans, jakarta, manrope, poppins].map((f) => f.variable).join(" ");

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  const icon = brand.iconUrl;
  return {
    // Every relative URL in metadata (canonical links, share images) resolves against the live domain.
    metadataBase: new URL(siteUrl()),
    title: { default: brand.name, template: `%s | ${brand.name}` },
    description: brand.tagline,
    applicationName: brand.name,
    openGraph: { siteName: brand.name, type: "website" },
    twitter: { card: "summary_large_image" },
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, title: brand.name, statusBarStyle: "black" },
    icons: icon
      ? { icon: [{ url: icon }], apple: icon }
      : {
          icon: [
            { url: "/favicon.ico" },
            { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          ],
          apple: "/icons/apple-touch-icon.png",
        },
    formatDetection: { telephone: false },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const brand = await getBrand();
  return {
    themeColor: brand.accent,
    width: "device-width",
    initialScale: 1,
    // Lets pages run under the notch and home bar; layouts pad with env(safe-area-inset-*).
    viewportFit: "cover",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [brand, year] = await Promise.all([getBrand(), currentYear()]);
  return (
    <html lang="en" className={`${FONT_VARS} h-full antialiased`}>
      <head>
        <style id="brand-theme">{brandCss(brand)}</style>
      </head>
      <body className="min-h-full flex flex-col">
        <BrandProvider brand={brand} year={year}>
          {children}
          <RegisterServiceWorker />
          <DialogHost />
          <MenuCloser />
          <Suspense fallback={null}>
            <VisitTracker />
          </Suspense>
        </BrandProvider>
      </body>
    </html>
  );
}
