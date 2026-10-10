"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { LocationCombobox } from "@/components/search/location-combobox";
import { Button } from "@/components/ui/button";
import { categoryPath, priceSteps } from "@/lib/search/query";
import { propertyTypeLabels } from "@/lib/domain/labels";
import type { ListingCategory } from "@/lib/domain/types";
import { cn, formatAEDCompact } from "@/lib/utils";
import { trackEvent } from "@/components/site/tracking";

const TABS: { value: ListingCategory; label: string }[] = [
  { value: "sale", label: "Buy" },
  { value: "rent", label: "Rent" },
  { value: "off-plan", label: "Off-plan" },
];

const residentialTypes = ["apartment", "villa", "townhouse", "penthouse"] as const;

function Cell({ label, htmlFor, children, className }: { label: string; htmlFor: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative flex min-w-0 flex-col justify-center px-4 py-3 lg:py-0", className)}>
      <label htmlFor={htmlFor} className="text-[12px] font-medium text-slate">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function BareSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[15px] text-navy focus:outline-none [&>option]:text-navy" />
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2 text-slate" />
    </div>
  );
}

export function HeroSearch() {
  const router = useRouter();
  const [category, setCategory] = React.useState<ListingCategory>("sale");
  const [location, setLocation] = React.useState({ communitySlug: "", text: "" });
  const [type, setType] = React.useState("");
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [beds, setBeds] = React.useState("");

  const steps = category === "rent" ? priceSteps.rent : priceSteps.sale;
  const priceSuffix = category === "rent" ? " / yr" : "";

  const switchCategory = (next: ListingCategory) => {
    setCategory(next);
    setMinPrice("");
    setMaxPrice("");
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.communitySlug) params.set("community", location.communitySlug);
    else if (location.text.trim()) params.set("q", location.text.trim());
    if (type) params.set("type", type);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (beds) params.set("beds", beds);
    trackEvent("hero_search", { category });
    const qs = params.toString();
    router.push(`${categoryPath[category]}${qs ? `?${qs}` : ""}`);
  };

  return (
    <form action="/properties" method="get" onSubmit={onSubmit} role="search" aria-label="Property search" className="w-full">
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="community" value={location.communitySlug} />
      <fieldset className="flex">
        <legend className="sr-only">What are you looking for?</legend>
        {TABS.map((tab) => {
          const selected = category === tab.value;
          return (
            <label
              key={tab.value}
              className={cn(
                "relative cursor-pointer px-5 py-2.5 text-[14px] font-semibold transition-colors first:rounded-tl-sm last:rounded-tr-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold",
                selected ? "bg-white text-navy" : "bg-navy/55 text-ivory/80 backdrop-blur-md hover:bg-navy/70 hover:text-ivory",
              )}
            >
              <input type="radio" name="_category" value={tab.value} checked={selected} onChange={() => switchCategory(tab.value)} className="sr-only" />
              {tab.label}
            </label>
          );
        })}
      </fieldset>

      <div className="grid grid-cols-2 rounded-tr-sm rounded-b-sm bg-white shadow-float lg:h-[84px] lg:grid-cols-[minmax(0,2.2fr)_repeat(4,minmax(0,1fr))_auto] lg:divide-x lg:divide-line">
        <Cell label="Location" htmlFor="hero-location" className="col-span-2 border-b border-line lg:col-span-1 lg:border-b-0 lg:pl-6">
          <LocationCombobox id="hero-location" communitySlug={location.communitySlug} text={location.text} onChange={setLocation} name="q" />
        </Cell>
        <Cell label="Property type" htmlFor="hero-type" className="border-b border-line lg:border-b-0">
          <BareSelect id="hero-type" name="type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Any type</option>
            {residentialTypes.map((t) => (
              <option key={t} value={t}>
                {propertyTypeLabels[t]}
              </option>
            ))}
          </BareSelect>
        </Cell>
        <Cell label="Bedrooms" htmlFor="hero-beds" className="border-b border-l border-line lg:border-b-0 lg:border-l-0">
          <BareSelect id="hero-beds" name="beds" value={beds} onChange={(e) => setBeds(e.target.value)}>
            <option value="">Any</option>
            <option value="0">Studio</option>
            <option value="1">1 bedroom</option>
            <option value="2">2 bedrooms</option>
            <option value="3">3 bedrooms</option>
            <option value="4">4 bedrooms</option>
            <option value="5">5+ bedrooms</option>
          </BareSelect>
        </Cell>
        <Cell label={category === "rent" ? "Min rent (yearly)" : "Min budget"} htmlFor="hero-min">
          <BareSelect id="hero-min" name="minPrice" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}>
            <option value="">No min</option>
            {steps.map((s) => (
              <option key={s} value={s} disabled={maxPrice !== "" && s > Number(maxPrice)}>
                {formatAEDCompact(s)}
                {priceSuffix}
              </option>
            ))}
          </BareSelect>
        </Cell>
        <Cell label={category === "rent" ? "Max rent (yearly)" : "Max budget"} htmlFor="hero-max" className="border-l border-line lg:border-l-0">
          <BareSelect id="hero-max" name="maxPrice" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
            <option value="">No max</option>
            {steps.map((s) => (
              <option key={s} value={s} disabled={minPrice !== "" && s < Number(minPrice)}>
                {formatAEDCompact(s)}
                {priceSuffix}
              </option>
            ))}
          </BareSelect>
        </Cell>
        <div className="col-span-2 p-3 lg:col-span-1 lg:flex lg:items-center lg:p-3">
          <Button type="submit" size="lg" className="w-full lg:h-full lg:px-8">
            Search properties
          </Button>
        </div>
      </div>
    </form>
  );
}
