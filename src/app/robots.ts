import type { MetadataRoute } from "next";
import { isDemoMode, siteConfig } from "@/config/site";

/**
 * While NEXT_PUBLIC_DEMO_MODE is on, the whole site is kept out of search engines so illustrative listings
 * are never indexed as real inventory. Internal and API routes are always disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  if (isDemoMode) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/crm", "/admin", "/login", "/api/", "/saved"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
