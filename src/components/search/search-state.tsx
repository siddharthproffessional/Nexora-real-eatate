"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { SearchQuery } from "@/lib/search/query";
import { toSearchParams } from "@/lib/search/query";
import { cn } from "@/lib/utils";

interface Ctx {
  pending: boolean;
  navigate: (next: Partial<SearchQuery>) => void;
}

const SearchContext = React.createContext<Ctx | null>(null);

/**
 * Keeps search state in the URL (shareable, back-button friendly, crawlable). Filter changes navigate
 * inside a transition so the current results stay visible, dimmed, until the new ones arrive.
 */
export function SearchStateProvider({
  basePath,
  query,
  fixedKeys,
  children,
}: {
  basePath: string;
  query: SearchQuery;
  fixedKeys: (keyof SearchQuery)[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const navigate = React.useCallback(
    (next: Partial<SearchQuery>) => {
      const merged = { ...query, page: 1, ...next };
      const params = toSearchParams(merged, fixedKeys);
      const qs = params.toString();
      startTransition(() => router.push(`${basePath}${qs ? `?${qs}` : ""}`, { scroll: false }));
    },
    [basePath, fixedKeys, query, router],
  );

  return <SearchContext.Provider value={{ pending, navigate }}>{children}</SearchContext.Provider>;
}

export function useSearchState() {
  const ctx = React.useContext(SearchContext);
  if (!ctx) throw new Error("useSearchState must be used inside SearchStateProvider");
  return ctx;
}

export function ResultsRegion({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useSearchState();
  return (
    <div aria-busy={pending} className={cn("transition-opacity duration-200", pending && "pointer-events-none opacity-50", className)}>
      {children}
    </div>
  );
}
