import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/lib/domain/types";
import { propertyTypeLabels } from "@/lib/domain/labels";
import { getCommunityName } from "@/lib/content/communities";
import { cn } from "@/lib/utils";
import { SaveButton } from "@/components/site/favorites";
import { ListingBadges, PriceTag, SpecList } from "./property-meta";

export function PropertyCard({
  property,
  layout = "grid",
  priority = false,
  sizes = "(min-width: 1280px) 400px, (min-width: 768px) 45vw, 92vw",
}: {
  property: Property;
  layout?: "grid" | "list";
  priority?: boolean;
  sizes?: string;
}) {
  const href = `/properties/${property.slug}`;
  const cover = property.images[0];
  const community = getCommunityName(property.communitySlug);
  const isList = layout === "list";

  return (
    <article className={cn("group relative flex", isList ? "flex-col gap-5 border-b border-line pb-6 sm:flex-row" : "flex-col")}>
      <div className={cn("relative overflow-hidden rounded-xs bg-navy-800", isList ? "aspect-[4/3] sm:w-[340px] sm:shrink-0" : "aspect-[4/3]")}>
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes={isList ? "(min-width: 640px) 340px, 92vw" : sizes}
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ivory/60">Photography coming soon</div>
        )}
        <ListingBadges property={property} className="absolute top-3 left-3 max-w-[calc(100%-4rem)]" />
        <SaveButton propertyId={property.id} title={property.title} className="absolute top-3 right-3 z-10" />
        {cover?.kind === "visualisation" ? (
          <span className="absolute bottom-2 left-3 text-[11px] font-medium text-ivory/90 [text-shadow:0_1px_2px_rgb(0_0_0/0.5)]">Visualisation</span>
        ) : null}
      </div>

      <div className={cn("flex flex-1 flex-col", isList ? "py-1" : "pt-4")}>
        <div className="flex items-center justify-between gap-3 text-[12.5px] text-slate">
          <span>
            {community}
            <span aria-hidden className="mx-1.5 text-line-strong">
              /
            </span>
            {propertyTypeLabels[property.type]}
          </span>
          <span className="tabular">{property.ref}</span>
        </div>
        <h3 className={cn("serif mt-1.5 leading-snug font-[480] text-navy", isList ? "text-[23px]" : "text-[20px]")}>
          <Link href={href} className="rounded-xs after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4">
            {property.title}
          </Link>
        </h3>
        {property.offPlan ? <p className="mt-1 text-[13px] text-slate">{property.offPlan.projectName}</p> : null}
        {isList ? <p className="mt-2 line-clamp-2 max-w-prose text-[14.5px] leading-relaxed text-navy-700">{property.summary}</p> : null}
        <div className={cn("flex flex-col gap-2", isList ? "mt-auto pt-4" : "mt-3")}>
          <PriceTag property={property} />
          <SpecList property={property} />
        </div>
      </div>
    </article>
  );
}
