import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type SmeProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  kind: "template" | "bundle" | "subscription";
  summary: string | null;
  priceMinor: number | null;
  currency: string;
  coverUrl: string | null;
};

const COLS = "id, slug, name, category, kind, summary, price_minor, currency, cover_url";

type Row = { id: string; slug: string; name: string; category: string; kind: string; summary: string | null; price_minor: number | null; currency: string; cover_url: string | null };

const toProduct = (r: Row): SmeProduct => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  category: r.category,
  kind: r.kind as SmeProduct["kind"],
  summary: r.summary,
  priceMinor: r.price_minor,
  currency: r.currency,
  coverUrl: r.cover_url,
});

// Category order on the SME Hub page.
export const SME_CATEGORIES = ["Investment Agreements", "Startup Documents", "Employment & HR", "Resolutions", "Forms", "Bundles", "Subscriptions"];

export async function getSmeProducts(): Promise<SmeProduct[]> {
  const { data } = await createAdminClient().from("sme_products").select(COLS).eq("status", "published").order("position");
  return (data ?? []).map(toProduct);
}

export async function getSmeProduct(slug: string): Promise<SmeProduct | null> {
  const { data } = await createAdminClient().from("sme_products").select(COLS).eq("status", "published").eq("slug", slug).maybeSingle();
  return data ? toProduct(data) : null;
}
