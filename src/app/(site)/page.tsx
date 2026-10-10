import type { Metadata } from "next";
import { getStore } from "@/lib/data";
import { communities, featuredCommunitySlugs, getCommunityPhoto } from "@/lib/content/communities";
import { Hero } from "@/components/home/hero";
import { CommunitiesIndex } from "@/components/home/communities-index";
import { InvestmentLedger } from "@/components/home/investment-ledger";
import { WhyUs } from "@/components/home/why-us";
import { InsightsPreview } from "@/components/home/insights-preview";
import { ConsultationSection } from "@/components/home/consultation-section";
import { PropertyCard } from "@/components/property/property-card";
import { SectionHeading } from "@/components/site/section-heading";
import { isDemoMode } from "@/config/site";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const store = getStore();
  const [featured, published, offPlan] = await Promise.all([
    store.properties.listFeatured(6),
    store.properties.listPublished(),
    store.properties.search({ category: "off-plan", sort: "price-asc", view: "grid", page: 1 }),
  ]);

  const communityItems = featuredCommunitySlugs.map((slug) => {
    const c = communities.find((x) => x.slug === slug)!;
    return {
      slug: c.slug,
      name: c.name,
      intro: c.intro,
      propertyStyles: c.propertyStyles,
      photo: getCommunityPhoto(c.slug),
      listingCount: published.filter((p) => p.communitySlug === c.slug).length,
    };
  });

  return (
    <>
      <Hero />

      <section aria-labelledby="featured-title" className="container-page py-20 lg:py-28">
        <SectionHeading
          id="featured-title"
          title="Featured properties"
          description={
            isDemoMode
              ? "A selection of homes and commercial space across Dubai. These are demonstration listings with illustrative prices."
              : "A selection of homes and commercial space across Dubai, chosen by our advisors."
          }
          action={{ href: "/properties", label: "View all properties" }}
        />
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <PropertyCard key={p.id} property={p} priority={i < 3} />
          ))}
        </div>
      </section>

      <section aria-labelledby="communities-title" className="border-t border-line bg-ivory-200/60 py-20 lg:py-28">
        <div className="container-page">
          <SectionHeading
            id="communities-title"
            title="Explore Dubai communities"
            description="Each neighbourhood suits a different way of living. Start with the area, then find the home."
            action={{ href: "/communities", label: "All communities" }}
          />
          <div className="mt-12">
            <CommunitiesIndex items={communityItems} />
          </div>
        </div>
      </section>

      <section aria-labelledby="invest-title" className="on-dark bg-navy py-20 text-ivory lg:py-28">
        <div className="container-page">
          <SectionHeading
            id="invest-title"
            tone="light"
            title="Investment opportunities"
            description="Off-plan projects with their entry prices and payment plans side by side. We show only what developers have supplied and what we have verified."
            action={{ href: "/off-plan", label: "All off-plan projects" }}
          />
          <div className="mt-12">
            <InvestmentLedger properties={offPlan.items} />
          </div>
        </div>
      </section>

      <section aria-labelledby="why-title" className="container-page py-20 lg:py-28">
        <WhyUs />
      </section>

      <section aria-labelledby="insights-title" className="border-t border-line py-20 lg:py-28">
        <div className="container-page">
          <SectionHeading
            id="insights-title"
            title="Market insights"
            description="Guides and commentary for buyers, tenants and investors. Editorial information, not legal or financial advice."
            action={{ href: "/insights", label: "All insights" }}
          />
          <div className="mt-12">
            <InsightsPreview />
          </div>
        </div>
      </section>

      <div className="border-t border-line bg-ivory-200/60">
        <ConsultationSection />
      </div>
    </>
  );
}
