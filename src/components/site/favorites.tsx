"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Saved properties, stored in the visitor's browser (localStorage). No account required and nothing is
 * sent to the server until the visitor submits an inquiry.
 */

const STORAGE_KEY = "nexora:saved-properties";

interface FavoritesContextValue {
  ids: string[];
  ready: boolean;
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
}

const FavoritesContext = React.createContext<FavoritesContextValue | null>(null);

function readStorage(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string").slice(0, 100) : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = React.useState<string[]>([]);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    // Hydrate from storage after mount so server and client render the same initial markup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIds(readStorage());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setIds(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = React.useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable (private mode) — keep in memory */
      }
      return next;
    });
  }, []);

  const value = React.useMemo(() => ({ ids, ready, toggle, isSaved: (id: string) => ids.includes(id) }), [ids, ready, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = React.useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}

export function SaveButton({
  propertyId,
  title,
  variant = "overlay",
  className,
}: {
  propertyId: string;
  title: string;
  variant?: "overlay" | "inline";
  className?: string;
}) {
  const { isSaved, toggle } = useFavorites();
  const saved = isSaved(propertyId);
  const label = saved ? `Remove ${title} from saved properties` : `Save ${title}`;

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => toggle(propertyId)}
        aria-pressed={saved}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-sm border px-4 text-sm font-medium transition-colors",
          saved ? "border-navy bg-navy text-ivory" : "border-line-strong bg-white text-navy hover:border-navy",
          className,
        )}
      >
        <Heart aria-hidden className={cn("size-4 transition-transform", saved && "scale-110 fill-gold stroke-gold")} />
        {saved ? "Saved" : "Save"}
        <span className="sr-only">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(propertyId);
      }}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? "Saved" : "Save"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full bg-white/92 text-navy shadow-[0_1px_3px_rgb(16_27_45/0.18)] transition-[transform,background-color] hover:scale-105 hover:bg-white active:scale-95",
        className,
      )}
    >
      <Heart aria-hidden className={cn("size-[17px] transition-all duration-300", saved ? "scale-110 fill-gold stroke-gold-deep" : "stroke-[1.75]")} />
    </button>
  );
}

export function SavedCount({ className }: { className?: string }) {
  const { ids, ready } = useFavorites();
  if (!ready || ids.length === 0) return null;
  return (
    <span
      className={cn(
        "tabular absolute -top-1 -right-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10.5px] leading-[18px] font-bold text-navy",
        className,
      )}
    >
      {ids.length}
    </span>
  );
}
