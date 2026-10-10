import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Check, FileText, Phone } from "lucide-react";
import { getStore } from "@/lib/data";
import type { Property } from "@/lib/domain/types";
import { categoryLabels, furnishingLabels, listingStatusLabels, propertyTypeLabels } from "@/lib/domain/labels";
import { getCommunity, getCommunityName } from "@/lib/content/communities";
import { categoryPath } from "@/lib/search/query";
import { formatArea, formatBathrooms, formatBedrooms, formatDate, initials } from "@/lib/utils";
import { siteConfig, isDemoMode } from "@/config/site";
import { Gallery } from "@/components/property/gallery";
import { ListingActions, WhatsAppButton } from "@/components/property/listing-actions";
import { ListingBadges, PriceTag } from "@/components/property/property-meta";
import { MapEmbed } from "@/components/property/map-embed";
import { PropertyCard } from "@/components/property/property-card";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ViewingForm } from "@/components/leads/viewing-form";
import { ListingJsonLd } from "@/components/seo/json-ld";
import { MobileEnquiryBar } from "@/components/property/mobile-enquiry-bar";
import { Badge } from "@/components/ui/badge";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

/**
 * Listing pages are statically generated and revalidated (ISR). Listings added later render on first request.
 * Rendering as a prerender (rather than a streamed dynamic response) also lets unknown slugs return a real 404
 * and renamed listings a real 308 redirect.
 */
export async function generateStaticParams() {
  try {
    const published = await getStore().properties.listPublished();
    return published.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

async function loadProperty(slug: string): Promise<Property | null> {
  const store = getStore();
  const property = await store.properties.getBySlug(slug);
  if (property) return property;
  // Titles can change; the reference at the end of the slug is permanent. Redirect old URLs to the current one.
  const ref = slug.match(/(nxr(?:-d)?-\d+)$/i)?.[1]?.toUpperCase();
  if (ref) {
    const all = await store.properties.listPublished();
    const match = all.find((p) => p.ref === ref);
    if (match) permanentRedirect(`/properties/${match.slug}`);
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getStore().properties.getBySlug(slug);
  if (!property) return { title: "Property not found", robots: { index: false } };
  const community = getCommunityName(property.communitySlug);
  const cover = property.images[0];
  return {
    title: `${property.title}, ${community}`,
    description: property.summary,
    alternates: { canonical: `/properties/${property.slug}` },
    openGraph: {
      title: `${property.title} in ${community}`,
      description: property.summary,
      url: `/properties/${property.slug}`,
      images: cover ? [{ url: `${cover.src}?auto=format&fit=crop&w=1200&h=630&q=75`, width: 1200, height: 630, alt: cover.alt }] : undefined,
    },
  };
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-t border-line py-3.5">
      <dt className="text-[12.5px] text-slate">{label}</dt>
      <dd className="mt-0.5 text-[15.5px] text-navy">{value}</dd>
    </div>
  );
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const property = await loadProperty(slug);
  if (!property) notFound();

  const store = getStore();
  const [similar, agent] = await Promise.all([
    store.properties.listSimilar(property, 3),
    property.agentId ? store.agents.getById(property.agentId) : Promise.resolve(null),
  ]);
  const community = getCommunity(property.communitySlug);
  const communityName = community?.name ?? property.communitySlug;
  const url = `${siteConfig.url}/properties/${property.slug}`;
  const isResidential = property.segment === "residential";
  const listPath = property.segment === "commercial" ? "/commercial" : categoryPath[property.category];
  const listName = property.segment === "commercial" ? "Commercial" : categoryLabels[property.category];

  return (
    <article>
      <ListingJsonLd property={property} />
      <div className="container-page pt-8 lg:pt-10">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: listName, path: listPath },
            { name: communityName, path: `/communities/${property.communitySlug}` },
            { name: property.ref, path: `/properties/${property.slug}` },
          ]}
        />

        <header className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <ListingBadges property={property} />
            <h1 className="display mt-4 max-w-[22ch] text-[2.3rem] sm:text-[3rem]">{property.title}</h1>
            <p className="mt-3 text-[15px] text-slate">
              {property.building ? `${property.building}, ` : ""}
              {communityName}, Dubai
              {property.offPlan ? <span className="text-navy-700"> — {property.offPlan.projectName}</span> : null}
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <PriceTag property={property} size="lg" />
            <ListingActions propertyId={property.id} title={property.title} url={url} />
          </div>
        </header>

        <div className="mt-8">
          <Gallery images={property.images} title={property.title} />
        </div>
      </div>

      <div className="container-page grid gap-14 py-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16 lg:py-16">
        <div className="min-w-0">
          <section aria-labelledby="facts-title">
            <h2 id="facts-title" className="sr-only">
              Key facts
            </h2>
            <dl className="grid grid-cols-2 gap-x-8 sm:grid-cols-3">
              <Fact label="Reference" value={<span className="tabular">{property.ref}</span>} />
              <Fact label="Property type" value={propertyTypeLabels[property.type]} />
              <Fact label="Listing" value={categoryLabels[property.category]} />
              {isResidential ? <Fact label="Bedrooms" value={formatBedrooms(property.bedrooms, true)} /> : null}
              <Fact label="Bathrooms" value={formatBathrooms(property.bathrooms, true)} />
              <Fact label="Built-up area" value={formatArea(property.areaSqft)} />
              {property.plotSqft ? <Fact label="Plot area" value={formatArea(property.plotSqft)} /> : null}
              {property.furnishing ? <Fact label="Furnishing" value={furnishingLabels[property.furnishing]} /> : null}
              <Fact label="Status" value={listingStatusLabels[property.status]} />
              <Fact label="Listed" value={formatDate(property.createdAt)} />
              <Fact
                label="Advertising permit"
                value={
                  property.verification ? (
                    <span className="tabular">{property.verification.permitNumber}</span>
                  ) : (
                    <span className="text-slate">Not yet verified</span>
                  )
                }
              />
            </dl>
          </section>

          {property.offPlan ? (
            <section aria-labelledby="offplan-title" className="mt-14 rounded-md border border-line bg-white p-6 sm:p-8">
              <h2 id="offplan-title" className="serif text-[26px] text-navy">
                Project details
              </h2>
              <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
                <Fact label="Project" value={property.offPlan.projectName} />
                <Fact label="Developer" value={property.offPlan.developer ?? <span className="text-slate">Not supplied</span>} />
                <Fact
                  label="Handover"
                  value={
                    property.offPlan.handover?.verified ? (
                      property.offPlan.handover.label
                    ) : (
                      <span className="text-slate">{property.offPlan.handover ? "Awaiting verification" : "Not supplied"}</span>
                    )
                  }
                />
                <Fact label="Payment plan" value={property.offPlan.paymentPlan ?? <span className="text-slate">Not supplied</span>} />
                <Fact
                  label="Rental yield"
                  value={
                    property.rentalYield ? (
                      `${property.rentalYield.grossPercent.toFixed(1)}% gross (${property.rentalYield.source}, ${property.rentalYield.asOf})`
                    ) : (
                      <span className="text-slate">Not published</span>
                    )
                  }
                />
              </dl>
              <p className="mt-5 text-[13px] leading-relaxed text-slate">
                Off-plan purchases carry construction and delivery risk. Confirm the project&rsquo;s registration and escrow account with the Dubai Land
                Department before reserving. Payment plans are as supplied and may change. This is not financial advice.
              </p>
            </section>
          ) : null}

          <section aria-labelledby="description-title" className="mt-14">
            <h2 id="description-title" className="serif text-[28px] text-navy">
              About this property
            </h2>
            <p className="mt-4 text-[18px] leading-relaxed text-navy">{property.summary}</p>
            <div className="mt-2 max-w-[68ch]">
              {property.description.map((para, i) => (
                <p key={i} className="mt-4 text-[16px] leading-[1.75] text-navy-700">
                  {para}
                </p>
              ))}
            </div>
          </section>

          {property.amenities.length ? (
            <section aria-labelledby="amenities-title" className="mt-14">
              <h2 id="amenities-title" className="serif text-[28px] text-navy">
                Features and amenities
              </h2>
              <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {property.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-3 text-[15px] text-navy-700">
                    <Check className="size-4 shrink-0 text-gold-deep" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {property.floorPlan ? (
            <section aria-labelledby="floorplan-title" className="mt-14">
              <h2 id="floorplan-title" className="serif text-[28px] text-navy">
                Floor plan
              </h2>
              <a
                href={property.floorPlan.src}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-navy underline underline-offset-4"
              >
                <FileText className="size-4" aria-hidden /> Open floor plan
              </a>
            </section>
          ) : null}

          <section aria-labelledby="location-title" className="mt-14">
            <h2 id="location-title" className="serif text-[28px] text-navy">
              Location
            </h2>
            {community ? (
              <p className="mt-3 max-w-[64ch] text-[15.5px] leading-relaxed text-navy-700">
                {community.intro}{" "}
                <Link href={`/communities/${community.slug}`} className="font-semibold text-gold-deep underline underline-offset-4">
                  Read the {community.name} guide
                </Link>
              </p>
            ) : null}
            <div className="mt-6">
              <MapEmbed lat={property.location.lat} lng={property.location.lng} label={`${communityName}, Dubai`} precision={property.location.precision} />
            </div>
          </section>
        </div>

        <aside id="enquire" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start" aria-label="Contact about this property">
          <div className="rounded-md bg-white p-6 shadow-panel sm:p-7">
            <div className="flex items-center gap-4">
              <span className="serif flex size-14 shrink-0 items-center justify-center rounded-full bg-navy text-[19px] text-gold">
                {agent ? initials(agent.name) : "N"}
              </span>
              <div>
                <p className="text-[15.5px] font-semibold text-navy">{agent?.name ?? "Nexora advisory team"}</p>
                <p className="text-[13px] text-slate">{agent?.title ?? "Property advisors"}</p>
                {agent?.languages.length ? <p className="mt-0.5 text-[12.5px] text-slate">Speaks {agent.languages.join(", ")}</p> : null}
              </div>
            </div>
            {agent?.isDemo && isDemoMode ? (
              <Badge tone="demo" className="mt-3">
                Demo advisor profile
              </Badge>
            ) : null}
            <div className="mt-5 grid gap-2">
              <WhatsAppButton message={`Hello, I'm interested in ${property.title} (${property.ref}): ${url}`} />
              <a
                href={siteConfig.contact.phoneHref}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-line-strong px-4 text-sm font-medium text-navy hover:border-navy"
              >
                <Phone className="size-4" aria-hidden /> Call {siteConfig.contact.phoneDisplay}
              </a>
            </div>
            <div className="mt-7 border-t border-line pt-6">
              <ViewingForm propertyId={property.id} propertyRef={property.ref} category={property.category} />
            </div>
          </div>
        </aside>
      </div>

      <MobileEnquiryBar property={property} />
      {similar.length ? (
        <section aria-labelledby="similar-title" className="border-t border-line bg-ivory-200/60 py-16 lg:py-20">
          <div className="container-page">
            <h2 id="similar-title" className="display text-[2rem] sm:text-[2.4rem]">
              Similar properties
            </h2>
            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
