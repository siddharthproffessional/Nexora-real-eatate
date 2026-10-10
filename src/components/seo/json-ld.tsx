import { siteConfig } from "@/config/site";
import type { Property } from "@/lib/domain/types";
import { getCommunityName } from "@/lib/content/communities";

/**
 * Structured data, limited to what the content actually supports:
 * - Organization details contain no placeholder phone numbers, addresses, ratings or licences.
 * - Listing markup is emitted only for real (non-demo) published listings.
 */

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/icon.svg`,
        description: siteConfig.description,
        areaServed: { "@type": "City", name: "Dubai" },
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${siteConfig.url}${item.path}`,
        })),
      }}
    />
  );
}

export function ListingJsonLd({ property }: { property: Property }) {
  if (property.isDemo || !property.published) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: property.title,
        description: property.summary,
        url: `${siteConfig.url}/properties/${property.slug}`,
        datePosted: property.createdAt,
        image: property.images.map((i) => i.src),
        offers: {
          "@type": "Offer",
          price: property.price,
          priceCurrency: "AED",
          availability: property.status === "available" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
        },
        contentLocation: { "@type": "Place", name: `${getCommunityName(property.communitySlug)}, Dubai` },
      }}
    />
  );
}
