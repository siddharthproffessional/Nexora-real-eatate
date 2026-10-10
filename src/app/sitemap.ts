import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { communities } from "@/lib/content/communities";
import { articles } from "@/lib/content/articles";
import { getStore } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const staticPaths = [
    "",
    "/properties",
    "/buy",
    "/rent",
    "/off-plan",
    "/commercial",
    "/communities",
    "/sell-or-lease",
    "/about",
    "/contact",
    "/insights",
    "/privacy",
    "/terms",
  ];
  const properties = await getStore().properties.listPublished();

  return [
    ...staticPaths.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...communities.map((c) => ({ url: `${base}/communities/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...articles.map((a) => ({ url: `${base}/insights/${a.slug}`, lastModified: a.publishedAt, changeFrequency: "yearly" as const, priority: 0.5 })),
    ...properties.map((p) => ({ url: `${base}/properties/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
