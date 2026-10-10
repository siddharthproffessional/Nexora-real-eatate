import type { Property } from "@/lib/domain/types";
import { getCommunityName } from "@/lib/content/communities";
import { PAGE_SIZE, type SearchQuery } from "./query";

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
}

function matchesKeyword(p: Property, q: string) {
  const haystack = [p.title, p.ref, p.summary, p.building ?? "", getCommunityName(p.communitySlug) ?? "", p.type, p.offPlan?.projectName ?? "", ...p.amenities]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

/** Pure, backend-agnostic filter used by the demo store (and by tests). Supabase applies the same rules in SQL. */
export function filterProperties(all: Property[], query: SearchQuery): Property[] {
  let list = all.filter((p) => p.published);
  if (query.category) list = list.filter((p) => p.category === query.category);
  if (query.segment) list = list.filter((p) => p.segment === query.segment);
  if (query.community) list = list.filter((p) => p.communitySlug === query.community);
  if (query.type) list = list.filter((p) => p.type === query.type);
  if (query.minPrice !== undefined) list = list.filter((p) => p.price >= query.minPrice!);
  if (query.maxPrice !== undefined) list = list.filter((p) => p.price <= query.maxPrice!);
  if (query.beds !== undefined) list = list.filter((p) => (query.beds === 5 ? p.bedrooms >= 5 : p.bedrooms === query.beds));
  if (query.baths !== undefined) list = list.filter((p) => p.bathrooms >= query.baths!);
  if (query.minArea !== undefined) list = list.filter((p) => p.areaSqft >= query.minArea!);
  if (query.maxArea !== undefined) list = list.filter((p) => p.areaSqft <= query.maxArea!);
  if (query.q) list = list.filter((p) => matchesKeyword(p, query.q!));

  const sorted = [...list];
  switch (query.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "area-desc":
      sorted.sort((a, b) => b.areaSqft - a.areaSqft);
      break;
    default:
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return sorted;
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE): SearchResult<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  return { items: items.slice((safePage - 1) * pageSize, safePage * pageSize), total, page: safePage, pageCount, pageSize };
}
