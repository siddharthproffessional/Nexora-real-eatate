import type { ListingCategory, PropertyType } from "@/lib/domain/types";
import type { SearchQuery } from "./query";

/**
 * Rule-based phrase understanding for the keyword box — e.g. "2 bed marina under 3m" becomes
 * { beds: 2, community: "dubai-marina", maxPrice: 3_000_000 }.
 *
 * Deterministic and transparent: every interpretation is shown to the visitor. It is the fallback for the
 * AI natural-language search integration point (src/lib/ai), not an AI feature in itself.
 */

const COMMUNITY_ALIASES: [RegExp, string][] = [
  [/\bdowntown(?:\s+dubai)?\b/, "downtown-dubai"],
  [/\b(?:dubai\s+)?marina\b/, "dubai-marina"],
  [/\b(?:the\s+)?palm(?:\s+jumeirah)?\b(?!\s+trees?)/, "palm-jumeirah"],
  [/\bbusiness\s+bay\b/, "business-bay"],
  [/\b(?:dubai\s+)?hills(?:\s+estate)?\b/, "dubai-hills-estate"],
  [/\b(?:dubai\s+)?creek(?:\s+harbou?r)?\b/, "dubai-creek-harbour"],
  [/\bjvc\b|\bjumeirah\s+village(?:\s+circle)?\b/, "jumeirah-village-circle"],
  [/\b(?:arabian\s+)?ranches\b/, "arabian-ranches"],
];

const TYPE_ALIASES: [RegExp, PropertyType][] = [
  [/\bvillas?\b/, "villa"],
  [/\bpenthouses?\b/, "penthouse"],
  [/\btown\s?houses?\b/, "townhouse"],
  [/\b(?:apartments?|flats?|apts?)\b/, "apartment"],
  [/\boffices?\b/, "office"],
  [/\b(?:retail|shops?)\b/, "retail"],
];

function parseAmount(raw: string, unit?: string) {
  const n = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(n)) return undefined;
  const u = unit?.toLowerCase();
  if (u && /^(m|mn|mil|million)$/.test(u)) return Math.round(n * 1_000_000);
  if (u && /^(k|thousand)$/.test(u)) return Math.round(n * 1_000);
  return n < 1000 ? Math.round(n * 1_000_000) : Math.round(n); // "under 3" in a property context means millions
}

export interface Interpretation {
  filters: Partial<Pick<SearchQuery, "beds" | "community" | "type" | "minPrice" | "maxPrice">>;
  category?: ListingCategory;
  keywords: string;
  understood: boolean;
}

export function interpretQuery(input: string): Interpretation {
  let text = ` ${input.toLowerCase().replace(/\s+/g, " ")} `;
  const filters: Interpretation["filters"] = {};
  let category: ListingCategory | undefined;

  const take = (re: RegExp, fn: (m: RegExpMatchArray) => void) => {
    const m = text.match(re);
    if (m) {
      fn(m);
      text = text.replace(m[0], " ");
    }
  };

  take(/\b(\d)\s*-?\s*(?:bed(?:room)?s?|br|bhk)\b/, (m) => (filters.beds = Math.min(Number(m[1]), 5)));
  take(/\bstudios?\b/, () => (filters.beds = 0));
  take(/\b(?:under|below|less than|max(?:imum)?|up to|upto|within)\s*(?:aed\s*)?([\d.,]+)\s*(m|mn|mil|million|k|thousand)?\b/, (m) => {
    filters.maxPrice = parseAmount(m[1]!, m[2]);
  });
  take(/\b(?:over|above|more than|min(?:imum)?|from|starting at)\s*(?:aed\s*)?([\d.,]+)\s*(m|mn|mil|million|k|thousand)?\b/, (m) => {
    filters.minPrice = parseAmount(m[1]!, m[2]);
  });
  take(/\boff[\s-]?plan\b/, () => (category = "off-plan"));
  take(/\b(?:for rent|to rent|rental|rent|lease)\b/, () => (category ??= "rent"));
  take(/\b(?:for sale|to buy|buy|purchase)\b/, () => (category ??= "sale"));

  for (const [re, slug] of COMMUNITY_ALIASES) {
    if (filters.community) break;
    take(re, () => (filters.community = slug));
  }
  for (const [re, type] of TYPE_ALIASES) {
    if (filters.type) break;
    take(re, () => (filters.type = type));
  }

  const keywords = text
    .replace(/\b(?:in|at|with|near|a|an|the|for|and|or|of|dubai|property|properties|home|homes|aed)\b/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { filters, category, keywords, understood: Object.keys(filters).length > 0 || Boolean(category) };
}
