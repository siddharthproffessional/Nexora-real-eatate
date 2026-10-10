import Link from "next/link";
import { X } from "lucide-react";
import { getStore } from "@/lib/data";
import { parseSearchParams, toSearchParams, type SearchQuery } from "@/lib/search/query";
import { interpretQuery } from "@/lib/search/interpret";
import type { ListingCategory, PropertySegment } from "@/lib/domain/types";
import { categoryLabels, propertyTypeLabels } from "@/lib/domain/labels";
import { getCommunityName } from "@/lib/content/communities";
import { formatAEDCompact, formatBedrooms } from "@/lib/utils";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { FilterPanel } from "./filter-panel";
import { ResultsToolbar } from "./results-toolbar";
import { ResultsRegion, SearchStateProvider } from "./search-state";
import { isDemoMode } from "@/config/site";

type Params = Record<string, string | string[] | undefined>;

interface SearchPageProps {
  basePath: string;
  title: string;
  intro: string;
  searchParams: Params;
  fixed?: { category?: ListingCategory; segment?: PropertySegment };
  showCategory?: boolean;
}

function chipList(query: SearchQuery, fixed: SearchPageProps["fixed"]) {
  const chips: { key: keyof SearchQuery; label: string }[] = [];
  if (query.category && !fixed?.category) chips.push({ key: "category", label: categoryLabels[query.category] });
  if (query.community) chips.push({ key: "community", label: getCommunityName(query.community) ?? query.community });
  if (query.type) chips.push({ key: "type", label: propertyTypeLabels[query.type] });
  if (query.minPrice !== undefined) chips.push({ key: "minPrice", label: `From ${formatAEDCompact(query.minPrice)}` });
  if (query.maxPrice !== undefined) chips.push({ key: "maxPrice", label: `Up to ${formatAEDCompact(query.maxPrice)}` });
  if (query.beds !== undefined) chips.push({ key: "beds", label: query.beds === 5 ? "5+ bedrooms" : formatBedrooms(query.beds, true) });
  if (query.baths !== undefined) chips.push({ key: "baths", label: `${query.baths}+ bathrooms` });
  if (query.minArea !== undefined) chips.push({ key: "minArea", label: `From ${query.minArea.toLocaleString("en")} sq ft` });
  if (query.maxArea !== undefined) chips.push({ key: "maxArea", label: `Up to ${query.maxArea.toLocaleString("en")} sq ft` });
  if (query.q) chips.push({ key: "q", label: `“${query.q}”` });
  return chips;
}

/** Shared listing search experience for /properties, /buy, /rent, /off-plan and /commercial. */
export async function SearchPage({ basePath, title, intro, searchParams, fixed, showCategory = false }: SearchPageProps) {
  const parsed = parseSearchParams(searchParams, fixed);

  // Phrase understanding: explicit URL filters always win over interpreted ones.
  let query: SearchQuery = parsed;
  let interpretedFrom: string | null = null;
  if (parsed.q) {
    const i = interpretQuery(parsed.q);
    if (i.understood) {
      interpretedFrom = parsed.q;
      query = {
        ...parsed,
        beds: parsed.beds ?? i.filters.beds,
        community: parsed.community ?? i.filters.community,
        type: parsed.type ?? i.filters.type,
        minPrice: parsed.minPrice ?? i.filters.minPrice,
        maxPrice: parsed.maxPrice ?? i.filters.maxPrice,
        category: fixed?.category ?? parsed.category ?? i.category,
        q: i.keywords || undefined,
      };
    }
  }

  const result = await getStore().properties.search(query);
  const fixedKeys = [...(fixed?.category ? (["category"] as const) : []), ...(fixed?.segment ? (["segment"] as const) : [])] as (keyof SearchQuery)[];
  const chips = chipList(query, fixed);
  const hrefWithout = (key: keyof SearchQuery) => {
    const params = toSearchParams({ ...query, [key]: undefined, page: 1 }, fixedKeys);
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };
  const pageHref = (page: number) => {
    const qs = toSearchParams({ ...query, page }, fixedKeys).toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

  return (
    <SearchStateProvider basePath={basePath} query={query} fixedKeys={fixedKeys}>
      <div className="border-b border-line bg-ivory-200/60">
        <div className="container-page pt-12 pb-10 lg:pt-16">
          <h1 className="display text-[2.4rem] sm:text-[3.2rem]">{title}</h1>
          <p className="mt-4 max-w-[62ch] text-[16px] leading-relaxed text-slate">{intro}</p>
          {isDemoMode ? <p className="mt-3 text-[13px] text-gold-deep">All listings shown are demonstration listings with illustrative prices.</p> : null}
        </div>
      </div>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14 lg:py-12">
        <aside aria-label="Filters" className="lg:sticky lg:top-24 lg:self-start">
          <FilterPanel query={query} segment={fixed?.segment} showCategory={showCategory} activeCount={chips.length} />
        </aside>

        <div>
          <ResultsToolbar query={query} total={result.total} />

          {interpretedFrom ? (
            <p className="mt-4 text-[14px] text-navy-700">
              Showing results for <span className="font-semibold">&ldquo;{interpretedFrom}&rdquo;</span>, read as the filters below.
            </p>
          ) : null}

          {chips.length ? (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
              {chips.map((c) => (
                <li key={c.key}>
                  <Link
                    href={hrefWithout(c.key)}
                    scroll={false}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line-strong bg-white pr-2.5 pl-3 text-[13px] text-navy hover:border-navy"
                  >
                    {c.label}
                    <X className="size-3.5 text-slate" aria-hidden />
                    <span className="sr-only">Remove filter</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={basePath}
                  scroll={false}
                  className="inline-flex h-8 items-center px-2 text-[13px] font-semibold text-gold-deep underline underline-offset-4"
                >
                  Clear all
                </Link>
              </li>
            </ul>
          ) : null}

          <ResultsRegion className="mt-8">
            {result.items.length === 0 ? (
              <div className="flex flex-col items-start gap-4 rounded-md border border-dashed border-line-strong bg-white/60 px-6 py-12 sm:px-10">
                <h2 className="serif text-[26px] text-navy">No properties match these filters</h2>
                <p className="max-w-[56ch] text-[15px] leading-relaxed text-slate">
                  Remove a filter above to widen the search, or tell an advisor what you need — we also hear about homes before they are listed.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="primary">
                    <Link href={basePath}>Clear all filters</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/contact#advisor">Ask an advisor</Link>
                  </Button>
                </div>
              </div>
            ) : query.view === "list" ? (
              <div className="flex flex-col gap-6">
                {result.items.map((p, i) => (
                  <PropertyCard key={p.id} property={p} layout="list" priority={i < 2} />
                ))}
              </div>
            ) : (
              <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((p, i) => (
                  <PropertyCard key={p.id} property={p} priority={i < 3} sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 92vw" />
                ))}
              </div>
            )}
          </ResultsRegion>

          {result.pageCount > 1 ? (
            <nav aria-label="Pagination" className="mt-14 flex items-center justify-between gap-4 border-t border-line pt-6">
              {result.page > 1 ? (
                <Link href={pageHref(result.page - 1)} className="text-[14px] font-semibold text-navy hover:text-gold-deep" rel="prev">
                  Previous
                </Link>
              ) : (
                <span className="text-[14px] text-slate-light" aria-hidden>
                  Previous
                </span>
              )}
              <ol className="flex items-center gap-1">
                {Array.from({ length: result.pageCount }, (_, i) => i + 1).map((n) => (
                  <li key={n}>
                    <Link
                      href={pageHref(n)}
                      aria-current={n === result.page ? "page" : undefined}
                      className={`tabular inline-flex size-10 items-center justify-center rounded-sm text-[14px] ${n === result.page ? "bg-navy text-ivory" : "text-navy hover:bg-ivory-200"}`}
                    >
                      <span className="sr-only">Page </span>
                      {n}
                    </Link>
                  </li>
                ))}
              </ol>
              {result.page < result.pageCount ? (
                <Link href={pageHref(result.page + 1)} className="text-[14px] font-semibold text-navy hover:text-gold-deep" rel="next">
                  Next
                </Link>
              ) : (
                <span className="text-[14px] text-slate-light" aria-hidden>
                  Next
                </span>
              )}
            </nav>
          ) : null}
        </div>
      </div>
    </SearchStateProvider>
  );
}

export function searchMetadataRobots(searchParams: Params) {
  // Filtered and paginated variants are not indexed; the clean category page is the canonical entry.
  const hasFilters = Object.keys(searchParams).some((k) => searchParams[k] !== undefined && searchParams[k] !== "");
  return hasFilters ? { index: false, follow: true } : undefined;
}
