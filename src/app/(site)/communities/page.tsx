import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { communities, getCommunityPhoto } from "@/lib/content/communities";
import { getStore } from "@/lib/data";
import { PageIntro } from "@/components/site/page-intro";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Dubai communities",
  description: "Guides to Dubai's leading residential and business communities — what each area is like, who it suits and the homes you will find there.",
  alternates: { canonical: "/communities" },
};

export default async function CommunitiesPage() {
  const published = await getStore().properties.listPublished();
  return (
    <>
      <PageIntro
        title="Dubai communities"
        intro="Where you live in Dubai shapes your commute, your weekends and the kind of home you can buy. Start with the neighbourhood that fits your life."
      />
      <div className="container-page py-14 lg:py-20">
        <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((c, i) => {
            const photo = getCommunityPhoto(c.slug);
            const count = published.filter((p) => p.communitySlug === c.slug).length;
            return (
              <li key={c.slug} className="group relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xs bg-navy-800">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    priority={i < 3}
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 92vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <h2 className="serif mt-5 text-[26px] leading-tight text-navy">
                  <Link href={`/communities/${c.slug}`} className="after:absolute after:inset-0">
                    {c.name}
                  </Link>
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-slate">{c.intro}</p>
                <p className="mt-3 text-[13px] text-navy-700">
                  {c.propertyStyles.join(", ")}
                  <span className="text-slate">
                    {" "}
                    ({count} {count === 1 ? "listing" : "listings"})
                  </span>
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
