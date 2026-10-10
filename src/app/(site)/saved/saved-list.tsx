"use client";

import * as React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Property } from "@/lib/domain/types";
import { useFavorites } from "@/components/site/favorites";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";

type State = { status: "loading" } | { status: "ready"; properties: Property[] } | { status: "error" };

export function SavedList() {
  const { ids, ready } = useFavorites();
  const [state, setState] = React.useState<State>({ status: "loading" });
  const key = ids.join(",");

  React.useEffect(() => {
    if (!ready) return;
    if (!key) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: "ready", properties: [] });
      return;
    }
    const controller = new AbortController();
    fetch(`/api/properties?ids=${encodeURIComponent(key)}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { properties: Property[] }) => {
        const order = new Map(key.split(",").map((id, i) => [id, i]));
        setState({ status: "ready", properties: [...data.properties].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)) });
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setState({ status: "error" });
      });
    return () => controller.abort();
  }, [key, ready]);

  if (!ready || state.status === "loading") {
    return (
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading saved properties">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/3] rounded-xs bg-ivory-300" />
            <div className="mt-4 h-4 w-2/3 rounded-xs bg-ivory-300" />
            <div className="mt-2 h-4 w-1/3 rounded-xs bg-ivory-300" />
          </div>
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <p role="alert" className="text-[15px] text-danger">
        Saved properties could not be loaded. Refresh the page to try again.
      </p>
    );
  }

  if (state.properties.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-md border border-dashed border-line-strong bg-white/60 px-6 py-12 sm:px-10">
        <Heart className="size-8 text-gold-deep" aria-hidden strokeWidth={1.4} />
        <h2 className="serif text-[26px] text-navy">Nothing saved yet</h2>
        <p className="max-w-[52ch] text-[15px] leading-relaxed text-slate">Tap the heart on any property to keep it here while you compare options.</p>
        <Button asChild>
          <Link href="/properties">Browse properties</Link>
        </Button>
      </div>
    );
  }

  const missing = ids.length - state.properties.length;
  return (
    <>
      <p className="mb-8 text-[14.5px] text-navy-700">
        {state.properties.length} saved {state.properties.length === 1 ? "property" : "properties"}
        {missing > 0 ? <span className="text-slate"> ({missing} no longer available)</span> : null}
      </p>
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {state.properties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </>
  );
}
