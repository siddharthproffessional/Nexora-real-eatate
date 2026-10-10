import { BedDouble, Bath, Ruler } from "lucide-react";
import type { Property } from "@/lib/domain/types";
import { cn, formatAED, formatBathrooms, formatBedrooms, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { isDemoMode } from "@/config/site";

export function PriceTag({ property, className, size = "md" }: { property: Pick<Property, "price" | "category">; className?: string; size?: "md" | "lg" }) {
  return (
    <p className={cn("tabular flex flex-wrap items-baseline gap-x-1.5 text-navy", className)}>
      {property.category === "off-plan" ? <span className={cn("text-slate", size === "lg" ? "text-base" : "text-[13px]")}>From</span> : null}
      <span className={cn("font-semibold tracking-[-0.01em]", size === "lg" ? "text-[28px] sm:text-[32px]" : "text-[19px]")}>{formatAED(property.price)}</span>
      {property.category === "rent" ? <span className={cn("text-slate", size === "lg" ? "text-base" : "text-[13px]")}>a year</span> : null}
    </p>
  );
}

export function SpecList({ property, className }: { property: Pick<Property, "bedrooms" | "bathrooms" | "areaSqft" | "segment">; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-navy-700", className)}>
      {property.segment === "residential" ? (
        <>
          <li className="inline-flex items-center gap-1.5">
            <BedDouble className="size-4 text-slate" aria-hidden strokeWidth={1.6} />
            <span>{formatBedrooms(property.bedrooms)}</span>
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Bath className="size-4 text-slate" aria-hidden strokeWidth={1.6} />
            <span>{formatBathrooms(property.bathrooms)}</span>
          </li>
        </>
      ) : null}
      <li className="inline-flex items-center gap-1.5">
        <Ruler className="size-4 text-slate" aria-hidden strokeWidth={1.6} />
        <span className="tabular">{formatNumber(property.areaSqft)} sq ft</span>
      </li>
    </ul>
  );
}

/** Status badges. "Verified" appears only when staff have recorded an advertising permit. */
export function ListingBadges({ property, className }: { property: Property; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {property.isDemo && isDemoMode ? <Badge tone="demo">Demo listing</Badge> : null}
      {property.verification ? <Badge tone="success">Verified (permit {property.verification.permitNumber})</Badge> : null}
      {property.category === "off-plan" ? <Badge tone="glass">Off-plan</Badge> : null}
      {property.featured && property.category !== "off-plan" ? <Badge tone="glass">Featured</Badge> : null}
      {property.status !== "available" ? (
        <Badge tone="gold">
          {property.status === "under_offer" ? "Under offer" : property.status === "sold" ? "Sold" : property.status === "rented" ? "Rented" : "Off market"}
        </Badge>
      ) : null}
    </div>
  );
}
