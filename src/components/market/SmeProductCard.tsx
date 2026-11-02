import Link from "next/link";
import { FileText } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { SmeProduct } from "@/lib/data/sme";

export function SmePrice({ p }: { p: Pick<SmeProduct, "priceMinor" | "currency"> }) {
  return p.priceMinor == null ? <span className="et-sme-poa">Price on request</span> : <b>{formatMoney(p.priceMinor, p.currency)}</b>;
}

export function SmeProductGrid({ products }: { products: SmeProduct[] }) {
  return (
    <div className="et-sme-grid">
      {products.map((p) => (
        <Link key={p.id} href={`/sme-hub/${p.slug}`} className="et-card et-sme-card">
          <span className="et-sme-cover">{p.coverUrl ? <img src={p.coverUrl} alt="" loading="lazy" /> : <FileText size={34} aria-hidden="true" />}</span>
          <span className="et-sme-body">
            <small>{p.category}</small>
            <b>{p.name}</b>
            <span className="et-sme-price">
              <SmePrice p={p} />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
