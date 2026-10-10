"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Input, Label, Select } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { communities } from "@/lib/content/communities";
import { categoryLabels, propertyTypeLabels } from "@/lib/domain/labels";
import { LISTING_CATEGORIES, type PropertySegment, type PropertyType } from "@/lib/domain/types";
import { priceSteps, type SearchQuery } from "@/lib/search/query";
import { formatAEDCompact } from "@/lib/utils";
import { useSearchState } from "./search-state";

const residentialTypes: PropertyType[] = ["apartment", "villa", "townhouse", "penthouse"];
const commercialTypes: PropertyType[] = ["office", "retail"];

interface FilterPanelProps {
  query: SearchQuery;
  segment?: PropertySegment;
  showCategory: boolean;
  activeCount: number;
}

function Filters({ query, segment, showCategory, idPrefix }: FilterPanelProps & { idPrefix: string }) {
  const { navigate } = useSearchState();
  const [keyword, setKeyword] = React.useState(query.q ?? "");
  const [minArea, setMinArea] = React.useState(query.minArea?.toString() ?? "");
  const [maxArea, setMaxArea] = React.useState(query.maxArea?.toString() ?? "");

  // Keep inputs in sync when the URL changes (e.g. a filter chip is removed).
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKeyword(query.q ?? "");
    setMinArea(query.minArea?.toString() ?? "");
    setMaxArea(query.maxArea?.toString() ?? "");
  }, [query.q, query.minArea, query.maxArea]);

  const steps = query.category === "rent" ? priceSteps.rent : priceSteps.sale;
  const types = segment === "commercial" ? commercialTypes : segment === "residential" ? residentialTypes : [...residentialTypes, ...commercialTypes];
  const num = (v: string) => (v === "" ? undefined : Number(v));
  const isResidential = segment !== "commercial";

  return (
    <form
      role="search"
      aria-label="Filter properties"
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ q: keyword.trim() || undefined, minArea: num(minArea), maxArea: num(maxArea) });
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-q`}>Keyword or phrase</Label>
        <div className="flex gap-2">
          <Input
            id={`${idPrefix}-q`}
            name="q"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. 2 bed marina under 3m"
            aria-describedby={`${idPrefix}-q-hint`}
          />
          <Button type="submit" variant="outline" className="shrink-0 px-4">
            Search
          </Button>
        </div>
        <p id={`${idPrefix}-q-hint`} className="text-xs text-slate">
          Try a phrase — we&rsquo;ll turn it into filters.
        </p>
      </div>

      {showCategory ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-category`}>Listing type</Label>
          <Select
            id={`${idPrefix}-category`}
            value={query.category ?? ""}
            onChange={(e) => navigate({ category: (e.target.value || undefined) as SearchQuery["category"], minPrice: undefined, maxPrice: undefined })}
          >
            <option key="any" value="">
              {segment === "commercial" ? "For sale or rent" : "All listings"}
            </option>
            {LISTING_CATEGORIES.filter((c) => segment !== "commercial" || c !== "off-plan").map((c) => (
              <option key={c} value={c}>
                {categoryLabels[c]}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-community`}>Community</Label>
        <Select id={`${idPrefix}-community`} value={query.community ?? ""} onChange={(e) => navigate({ community: e.target.value || undefined })}>
          <option key="any" value="">
            All communities
          </option>
          {communities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-type`}>Property type</Label>
        <Select
          id={`${idPrefix}-type`}
          value={query.type ?? ""}
          onChange={(e) => navigate({ type: (e.target.value || undefined) as PropertyType | undefined })}
        >
          <option key="any" value="">
            Any type
          </option>
          {types.map((t) => (
            <option key={t} value={t}>
              {propertyTypeLabels[t]}
            </option>
          ))}
        </Select>
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-[13px] font-medium text-navy-700">{query.category === "rent" ? "Annual rent (AED)" : "Price (AED)"}</legend>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <Select aria-label="Minimum price" value={query.minPrice?.toString() ?? ""} onChange={(e) => navigate({ minPrice: num(e.target.value) })}>
            <option key="any" value="">
              No min
            </option>
            {steps.map((s) => (
              <option key={s} value={s}>
                {formatAEDCompact(s)}
              </option>
            ))}
          </Select>
          <Select aria-label="Maximum price" value={query.maxPrice?.toString() ?? ""} onChange={(e) => navigate({ maxPrice: num(e.target.value) })}>
            <option key="any" value="">
              No max
            </option>
            {steps.map((s) => (
              <option key={s} value={s}>
                {formatAEDCompact(s)}
              </option>
            ))}
          </Select>
        </div>
      </fieldset>

      {isResidential ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-beds`}>Bedrooms</Label>
            <Select id={`${idPrefix}-beds`} value={query.beds?.toString() ?? ""} onChange={(e) => navigate({ beds: num(e.target.value) })}>
              <option key="any" value="">
                Any
              </option>
              <option key="0" value="0">
                Studio
              </option>
              {[1, 2, 3, 4].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
              <option key="5" value="5">
                5+
              </option>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-baths`}>Bathrooms</Label>
            <Select id={`${idPrefix}-baths`} value={query.baths?.toString() ?? ""} onChange={(e) => navigate({ baths: num(e.target.value) })}>
              <option key="any" value="">
                Any
              </option>
              {[1, 2, 3, 4].map((b) => (
                <option key={b} value={b}>
                  {b}+
                </option>
              ))}
            </Select>
          </div>
        </div>
      ) : null}

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-[13px] font-medium text-navy-700">Built-up area (sq ft)</legend>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <Input
            aria-label="Minimum area in square feet"
            inputMode="numeric"
            placeholder="Min"
            value={minArea}
            onChange={(e) => setMinArea(e.target.value.replace(/\D/g, ""))}
            onBlur={() => navigate({ minArea: num(minArea) })}
          />
          <Input
            aria-label="Maximum area in square feet"
            inputMode="numeric"
            placeholder="Max"
            value={maxArea}
            onChange={(e) => setMaxArea(e.target.value.replace(/\D/g, ""))}
            onBlur={() => navigate({ maxArea: num(maxArea) })}
          />
        </div>
      </fieldset>
    </form>
  );
}

export function FilterPanel(props: FilterPanelProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <div className="hidden lg:block">
        <Filters {...props} idPrefix="filters" />
      </div>
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-center">
              <SlidersHorizontal className="size-4" aria-hidden />
              Filters{props.activeCount ? ` (${props.activeCount})` : ""}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="px-5 pt-6 pb-6">
            <SheetTitle className="serif text-[24px]">Filters</SheetTitle>
            <SheetDescription className="mt-1 text-[13px] text-slate">Results update as you change filters.</SheetDescription>
            <div className="mt-6">
              <Filters {...props} idPrefix="filters-mobile" />
            </div>
            <Button className="mt-6 w-full" size="lg" onClick={() => setOpen(false)}>
              Show results
            </Button>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
