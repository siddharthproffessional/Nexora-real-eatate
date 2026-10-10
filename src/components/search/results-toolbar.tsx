"use client";

import { LayoutGrid, List } from "lucide-react";
import { SORT_OPTIONS, type SearchQuery, type SortOption } from "@/lib/search/query";
import { cn } from "@/lib/utils";
import { useSearchState } from "./search-state";

export function ResultsToolbar({ query, total }: { query: SearchQuery; total: number }) {
  const { navigate, pending } = useSearchState();
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
      <p className="text-[14.5px] text-navy-700" aria-live="polite">
        <span className="tabular font-semibold text-navy">{total}</span> {total === 1 ? "property" : "properties"}
        {pending ? <span className="ml-2 text-slate">Updating…</span> : null}
      </p>
      <div className="flex items-center gap-3">
        <label htmlFor="sort" className="sr-only">
          Sort by
        </label>
        <select
          id="sort"
          value={query.sort}
          onChange={(e) => navigate({ sort: e.target.value as SortOption, page: query.page })}
          className="h-10 cursor-pointer rounded-sm border border-line-strong bg-white px-3 text-[14px] text-navy hover:border-navy"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div role="group" aria-label="Layout" className="hidden overflow-hidden rounded-sm border border-line-strong sm:flex">
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={query.view === v}
              onClick={() => navigate({ view: v, page: query.page })}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center transition-colors",
                query.view === v ? "bg-navy text-ivory" : "bg-white text-navy hover:bg-ivory-200",
              )}
            >
              {v === "grid" ? <LayoutGrid className="size-4" aria-hidden /> : <List className="size-4" aria-hidden />}
              <span className="sr-only">{v === "grid" ? "Grid view" : "List view"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
