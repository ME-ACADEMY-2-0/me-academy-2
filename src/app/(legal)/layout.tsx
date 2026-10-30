import { BrandLogo } from "@/components/brand/BrandLogo";
import Link from "next/link";
import "./legal.css";
import { currentYear, getBrand } from "@/lib/brand";

export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const [brand, year] = await Promise.all([getBrand(), currentYear()]);
  return (
    <div className="et-legal">
      <header className="et-legal-top">
        <Link href="/" className="et-legal-logo">
          <BrandLogo />
        </Link>
        <nav>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refund-policy">Refunds</Link>
          <Link href="/login">Sign in</Link>
        </nav>
      </header>
      <main className="et-legal-doc">{children}</main>
      <footer className="et-legal-foot">© {year} {brand.name}</footer>
    </div>
  );
}
