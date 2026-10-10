import { z } from "zod";
import { FURNISHING_OPTIONS, LISTING_CATEGORIES, LISTING_STATUSES, PROPERTY_SEGMENTS, PROPERTY_TYPES } from "@/lib/domain/types";
import { communities } from "@/lib/content/communities";

const communitySlugs = communities.map((c) => c.slug) as [string, ...string[]];

const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : typeof v === "string" ? v.trim() : v), z.string().max(max).nullable().optional());
const intField = (min: number, max: number, message: string) =>
  z.preprocess(
    (v) => (v === "" || v === undefined ? NaN : Number(String(v).replace(/,/g, ""))),
    z.number(message).int(message).min(min, message).max(max, message),
  );
const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? null : Number(String(v).replace(/,/g, ""))),
    z.number().int().min(min).max(max).nullable().optional(),
  );
const lines = z.preprocess(
  (v) =>
    typeof v === "string"
      ? v
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean)
      : v,
  z.array(z.string().max(2000)).max(40),
);
const commaOrLines = z.preprocess(
  (v) =>
    typeof v === "string"
      ? v
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : v,
  z.array(z.string().max(80)).max(40),
);
const bool = z.preprocess((v) => v === true || v === "true" || v === "on" || v === "1", z.boolean());

/** Listing fields staff can create or edit. Server-side source of truth for the admin forms. */
export const propertyInputSchema = z
  .object({
    title: z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().min(6, "Enter a descriptive title").max(140)),
    category: z.enum(LISTING_CATEGORIES, "Choose a category"),
    segment: z.enum(PROPERTY_SEGMENTS, "Choose residential or commercial"),
    type: z.enum(PROPERTY_TYPES, "Choose a property type"),
    communitySlug: z.enum(communitySlugs, "Choose a community"),
    building: optionalText(120),
    price: intField(1_000, 2_000_000_000, "Enter a price in AED"),
    bedrooms: intField(0, 20, "Enter bedrooms (0 for studio)"),
    bathrooms: intField(0, 20, "Enter bathrooms"),
    areaSqft: intField(100, 500_000, "Enter the built-up area in sq ft"),
    plotSqft: optionalInt(100, 2_000_000),
    furnishing: z.preprocess((v) => (v === "" ? null : v), z.enum(FURNISHING_OPTIONS).nullable().optional()),
    summary: z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().min(20, "Write a one or two sentence summary").max(400)),
    description: lines.refine((d) => d.length > 0, "Add a description"),
    amenities: commaOrLines,
    agentId: optionalText(64),
    featured: bool.optional().default(false),
    published: bool.optional().default(false),
    status: z.enum(LISTING_STATUSES).default("available"),
    // Off-plan
    offPlanProjectName: optionalText(140),
    offPlanDeveloper: optionalText(140),
    offPlanHandover: optionalText(60),
    offPlanHandoverVerified: bool.optional().default(false),
    offPlanPaymentPlan: optionalText(300),
    // Verification (advertising permit)
    permitNumber: optionalText(60),
    // Rental yield — only with a citable source
    yieldPercent: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().min(0).max(30).nullable().optional()),
    yieldSource: optionalText(200),
    yieldAsOf: optionalText(10),
  })
  .superRefine((d, ctx) => {
    if (d.category === "off-plan" && !d.offPlanProjectName) {
      ctx.addIssue({ code: "custom", path: ["offPlanProjectName"], message: "Off-plan listings need a project name" });
    }
    if (d.segment === "commercial" && !["office", "retail"].includes(d.type)) {
      ctx.addIssue({ code: "custom", path: ["type"], message: "Commercial listings must be an office or retail unit" });
    }
    if (d.yieldPercent != null && (!d.yieldSource || !d.yieldAsOf)) {
      ctx.addIssue({ code: "custom", path: ["yieldSource"], message: "A rental yield needs a data source and an as-of date" });
    }
    if (d.offPlanHandoverVerified && !d.offPlanHandover) {
      ctx.addIssue({ code: "custom", path: ["offPlanHandover"], message: "Enter the handover date you verified" });
    }
  });

export type PropertyInput = z.output<typeof propertyInputSchema>;

export const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;
export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

/** Check magic bytes so a renamed file can't masquerade as an image. */
export function sniffImageType(bytes: Uint8Array): keyof typeof ALLOWED_IMAGE_TYPES | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return "image/webp";
  return null;
}
