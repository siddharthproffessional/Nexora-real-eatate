import type { Property } from "@/lib/domain/types";
import type { PropertyInput } from "@/lib/validation/property";
import { communities } from "@/lib/content/communities";
import { slugify } from "@/lib/utils";

/** Apply validated admin input to a property record (shared by both backends). */
export function applyPropertyInput(
  base: Property,
  input: PropertyInput,
  opts: { canPublish: boolean; canVerify: boolean; canAssign: boolean; actorName: string; now: string },
): Property {
  const community = communities.find((c) => c.slug === input.communitySlug)!;
  const next: Property = {
    ...base,
    title: input.title,
    category: input.category,
    segment: input.segment,
    type: input.type,
    communitySlug: input.communitySlug,
    building: input.building ?? null,
    price: input.price,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    areaSqft: input.areaSqft,
    plotSqft: input.plotSqft ?? null,
    furnishing: input.furnishing ?? null,
    summary: input.summary,
    description: input.description,
    amenities: input.amenities,
    status: input.status,
    location: base.location.precision === "exact" ? base.location : { ...community.location, precision: "community" },
    offPlan:
      input.category === "off-plan"
        ? {
            projectName: input.offPlanProjectName ?? "",
            developer: input.offPlanDeveloper ?? null,
            handover: input.offPlanHandover ? { label: input.offPlanHandover, verified: Boolean(input.offPlanHandoverVerified) } : null,
            paymentPlan: input.offPlanPaymentPlan ?? null,
          }
        : null,
    rentalYield:
      input.yieldPercent != null && input.yieldSource && input.yieldAsOf
        ? { grossPercent: input.yieldPercent, source: input.yieldSource, asOf: input.yieldAsOf }
        : null,
    updatedAt: opts.now,
  };
  if (opts.canAssign) next.agentId = input.agentId ?? null;
  if (opts.canPublish) {
    next.published = Boolean(input.published);
    next.featured = Boolean(input.featured);
  }
  if (opts.canVerify) {
    if (input.permitNumber) {
      next.verification =
        base.verification?.permitNumber === input.permitNumber
          ? base.verification
          : { permitNumber: input.permitNumber, verifiedAt: opts.now, verifiedBy: opts.actorName };
    } else {
      next.verification = null;
    }
  }
  if (!base.slug || base.title !== input.title) next.slug = `${slugify(input.title)}-${base.ref.toLowerCase()}`;
  return next;
}

export function nextRef(existing: string[]) {
  const max = existing.reduce((m, ref) => {
    const n = Number(ref.match(/(\d+)$/)?.[1] ?? 0);
    return n > m ? n : m;
  }, 5000);
  return `NXR-${max + 1}`;
}
