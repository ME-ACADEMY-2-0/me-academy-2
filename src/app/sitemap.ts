import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/email/site";

import { PROGRAMMES, SME_SECTIONS, TOPICS } from "@/lib/site-content";

const STATIC = [
  "",
  "/courses",
  "/legal-training",
  "/nba-icle",
  "/sme-hub",
  "/about",
  "/mary-ekemezie",
  "/facilitators",
  "/insights",
  "/resources",
  "/testimonials",
  "/alumni",
  "/faq",
  "/help",
  "/contact",
  "/certificate",
  "/privacy",
  "/terms",
  "/refund-policy",
  ...TOPICS.map((t) => `/legal-training/${t.slug}`),
  ...PROGRAMMES.map((p) => `/nba-icle/${p.slug}`),
  ...SME_SECTIONS.map((s) => `/sme-hub/${s.slug}`),
];

// Every public page: the fixed ones plus live courses, blog posts and public profiles.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const db = createAdminClient();
  const base = siteUrl();
  const [{ data: courses }, { data: posts }, { data: people }, { data: smeProducts }] = await Promise.all([
    db.from("courses").select("slug, updated_at").eq("status", "published"),
    db.from("blog_posts").select("slug, updated_at").neq("status", "draft").lte("published_at", new Date().toISOString()),
    db.from("profiles").select("username, updated_at").eq("profile_public", true).eq("status", "active").is("deleted_at", null).not("username", "is", null),
    db.from("sme_products").select("slug, updated_at").eq("status", "published"),
  ]);
  return [
    ...STATIC.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...(courses ?? []).map((c) => ({ url: `${base}/courses/${c.slug}`, lastModified: c.updated_at, priority: 0.8 })),
    ...(posts ?? []).map((p) => ({ url: `${base}/insights/${p.slug}`, lastModified: p.updated_at, priority: 0.5 })),
    ...(smeProducts ?? []).map((p) => ({ url: `${base}/sme-hub/${p.slug}`, lastModified: p.updated_at, priority: 0.5 })),
    ...(people ?? []).map((p) => ({ url: `${base}/@${p.username}`, lastModified: p.updated_at, priority: 0.3 })),
  ];
}
