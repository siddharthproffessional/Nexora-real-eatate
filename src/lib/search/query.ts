import { z } from "zod";
import { LISTING_CATEGORIES, PROPERTY_SEGMENTS, PROPERTY_TYPES, type ListingCategory, type PropertySegment } from "@/lib/domain/types";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "area-desc", label: "Largest first" },
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const PAGE_SIZE = 9;

/** Lenient parsing: invalid values are dropped rather than failing the page. */
const num = z.preprocess((v) => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(String(v).replace(/[, ]/g, ""));
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
}, z.number().int().nonnegative().optional());

const oneOf = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess((v) => (typeof v === "string" && (values as readonly string[]).includes(v) ? v : undefined), z.enum(values).optional());

const text = (max: number) =>
  z.preprocess((v) => {
    if (typeof v !== "string") return undefined;
    const t = v.trim().slice(0, max);
    return t.length ? t : undefined;
  }, z.string().optional());

export const searchQuerySchema = z.object({
  category: oneOf(LISTING_CATEGORIES),
  segment: oneOf(PROPERTY_SEGMENTS),
  q: text(120),
  community: text(80),
  type: oneOf(PROPERTY_TYPES),
  minPrice: num,
  maxPrice: num,
  beds: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : ["0", "1", "2", "3", "4", "5"].includes(String(v)) ? Number(v) : undefined),
    z.number().int().optional(),
  ),
  baths: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : ["1", "2", "3", "4"].includes(String(v)) ? Number(v) : undefined),
    z.number().int().optional(),
  ),
  minArea: num,
  maxArea: num,
  sort: z.preprocess(
    (v) => (["newest", "price-asc", "price-desc", "area-desc"].includes(String(v)) ? v : "newest"),
    z.enum(["newest", "price-asc", "price-desc", "area-desc"]),
  ),
  view: z.preprocess((v) => (v === "list" ? "list" : "grid"), z.enum(["grid", "list"])),
  page: z.preprocess((v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 1 ? Math.min(Math.floor(n), 500) : 1;
  }, z.number().int().min(1)),
});

export type SearchQuery = z.output<typeof searchQuerySchema>;

type RawParams = Record<string, string | string[] | undefined>;

export function parseSearchParams(params: RawParams, fixed?: { category?: ListingCategory; segment?: PropertySegment }): SearchQuery {
  const flat: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(params)) flat[k] = Array.isArray(v) ? v[0] : v;
  const parsed = searchQuerySchema.parse(flat);
  return { ...parsed, ...(fixed?.category ? { category: fixed.category } : {}), ...(fixed?.segment ? { segment: fixed.segment } : {}) };
}

/** Serialise a query back to URL params, omitting defaults. */
export function toSearchParams(query: Partial<SearchQuery>, omit: (keyof SearchQuery)[] = []) {
  const params = new URLSearchParams();
  const entries: [keyof SearchQuery, unknown][] = Object.entries(query) as [keyof SearchQuery, unknown][];
  for (const [k, v] of entries) {
    if (omit.includes(k) || v === undefined || v === null || v === "") continue;
    if (k === "sort" && v === "newest") continue;
    if (k === "view" && v === "grid") continue;
    if (k === "page" && v === 1) continue;
    params.set(k, String(v));
  }
  return params;
}

export const categoryPath: Record<ListingCategory, string> = {
  sale: "/buy",
  rent: "/rent",
  "off-plan": "/off-plan",
};

/** Price steps for budget selects. Rent values are annual. */
export const priceSteps = {
  sale: [500_000, 750_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000, 5_000_000, 7_500_000, 10_000_000, 15_000_000, 25_000_000],
  rent: [50_000, 75_000, 100_000, 150_000, 200_000, 300_000, 500_000, 750_000],
};
