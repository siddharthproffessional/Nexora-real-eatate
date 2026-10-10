import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { communities, getCommunity, getCommunityPhoto } from "@/lib/content/communities";
import { getStore } from "@/lib/data";
import { PhotoHero } from "@/components/site/page-intro";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { PropertyCard } from "@/components/property/property-card";
import { MapEmbed } from "@/components/property/map-embed";
import { ConsultationSection } from "@/components/home/consultation-section";
import { Button } from "@/components/ui/button";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return communities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getCommunity(slug);
  if (!c) return { title: "Community not found" };
  const photo = getCommunityPhoto(slug);
  return {
    title: `${c.name} community guide`,
    description: `${c.intro} What it is like to live in ${c.name}, who it suits, and homes available there.`,
    alternates: { canonical: `/communities/${c.slug}` },
    openGraph: { images: [{ url: `${photo.src}?auto=format&fit=crop&w=1200&h=630&q=75`, width: 1200, height: 630, alt: photo.alt }] },
  };
}

export default async function CommunityPage({ params }: Props) {
  const { slug } = await params;
  const community = getCommunity(slug);
  if (!community) notFound();

  const result = await getStore().properties.search({ community: slug, sort: "newest", view: "grid", page: 1 });

  return (
    <>
      <PhotoHero photo={getCommunityPhoto(slug)} title={community.name} intro={community.intro} />
      <div className="container-page pt-8">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Communities", path: "/communities" },
            { name: community.name, path: `/communities/${community.slug}` },
          ]}
        />
      </div>

      <div className="container-page grid gap-14 py-12 lg:grid-cols-12 lg:py-16">
        <section aria-labelledby="overview-title" className="lg:col-span-7">
          <h2 id="overview-title" className="serif text-[30px] text-navy">
            Living in {community.name}
          </h2>
          {community.overview.map((p, i) => (
            <p key={i} className="mt-5 max-w-[64ch] text-[16.5px] leading-[1.75] text-navy-700">
              {p}
            </p>
          ))}
          <h3 className="mt-10 text-[15px] font-semibold text-navy">Why people choose {community.name}</h3>
          <ul className="mt-4 grid gap-3">
            {community.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-[15.5px] text-navy-700">
                <Check className="mt-1 size-4 shrink-0 text-gold-deep" aria-hidden />
                {h}
              </li>
            ))}
          </ul>
        </section>
        <aside className="lg:col-span-5">
          <dl className="grid grid-cols-2 gap-x-6 border-t border-line">
            <div className="col-span-2 border-b border-line py-4">
              <dt className="text-[12.5px] text-slate">Typical homes</dt>
              <dd className="mt-1 text-[15.5px] text-navy">{community.propertyStyles.join(", ")}</dd>
            </div>
            <div className="border-b border-line py-4">
              <dt className="text-[12.5px] text-slate">Ownership for international buyers</dt>
              <dd className="mt-1 text-[15.5px] text-navy">{community.freehold ? "Freehold area" : "Check tenure"}</dd>
            </div>
            <div className="border-b border-line py-4">
              <dt className="text-[12.5px] text-slate">Listings on this site</dt>
              <dd className="tabular mt-1 text-[15.5px] text-navy">{result.total}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[12.5px] leading-relaxed text-slate">Freehold status should be confirmed for each property with the Dubai Land Department.</p>
          <div className="mt-8">
            <MapEmbed lat={community.location.lat} lng={community.location.lng} label={`${community.name}, Dubai`} precision="community" />
          </div>
        </aside>
      </div>

      <section aria-labelledby="community-listings" className="border-t border-line bg-ivory-200/60 py-16 lg:py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="community-listings" className="display text-[2rem] sm:text-[2.5rem]">
              Properties in {community.name}
            </h2>
            {result.total > 0 ? (
              <Link
                href={`/properties?community=${community.slug}`}
                className="text-[14.5px] font-semibold text-navy underline decoration-gold-deep/50 underline-offset-[6px]"
              >
                View all {result.total}
              </Link>
            ) : null}
          </div>
          {result.items.length ? (
            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.slice(0, 6).map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-start gap-4">
              <p className="max-w-[56ch] text-[15.5px] text-slate">
                There are no listings in {community.name} right now. Tell us what you are looking for and an advisor will search for you.
              </p>
              <Button asChild>
                <Link href="#advisor">Ask an advisor</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
      <ConsultationSection />
    </>
  );
}
