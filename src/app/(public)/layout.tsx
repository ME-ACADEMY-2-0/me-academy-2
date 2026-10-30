import { Suspense } from "react";
import { JsonLd, organization, website } from "@/lib/seo";
import "../(app)/app.css";
import { getPlatformSettings, whatsappLink } from "@/lib/platform";
import { PublicFrame } from "./PublicFrame";
import { getBrand } from "@/lib/brand";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const brand = await getBrand();
  return (
    <PublicFrame
      footerLinks={
        <Suspense fallback={null}>
          <FooterLinks />
        </Suspense>
      }
    >
      <JsonLd data={[organization({ name: brand.name, logo: brand.logoUrl }), website(brand.name)]} />
      {children}
    </PublicFrame>
  );
}

// Footer contact + social links from Admin > Settings > Platform. Streams in so pages stay prerenderable.
async function FooterLinks() {
  const s = await getPlatformSettings();
  const links = [
    ...(s.supportWhatsapp ? [{ label: "Chat on WhatsApp", href: whatsappLink(s.supportWhatsapp) }] : []),
    ...(s.supportEmail ? [{ label: "Email us", href: `mailto:${s.supportEmail}` }] : []),
    ...s.socials,
  ];
  if (!links.length) return null;
  return (
    <nav className="et-inline">
      {links.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
          {l.label}
        </a>
      ))}
    </nav>
  );
}
