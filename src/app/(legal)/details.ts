import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getBrand } from "@/lib/brand";
import { getPlatformSettings } from "@/lib/platform";
import { siteHost } from "@/lib/email/site";

// School name, web address and contact email for the legal pages.
export async function legalDetails() {
  "use cache";
  cacheTag("brand");
  cacheLife("days");
  const [brand, platform] = await Promise.all([getBrand(), getPlatformSettings()]);
  return { name: brand.name, host: siteHost(), contact: platform.supportEmail || process.env.CONTACT_INBOX || "[support email]" };
}
