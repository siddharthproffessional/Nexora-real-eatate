"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/config/media";
import { cn } from "@/lib/utils";

interface Item {
  slug: string;
  name: string;
  intro: string;
  propertyStyles: string[];
  photo: Photo;
  listingCount: number;
}

/**
 * Editorial community index: names on the left, photograph on the right.
 * Implemented as a vertical tablist (arrow keys move between communities); on small screens it becomes
 * a swipeable row of cards.
 */
export function CommunitiesIndex({ items }: { items: Item[] }) {
  const [active, setActive] = React.useState(0);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const current = items[active]!;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <>
      {/* Desktop: index + photograph */}
      <div className="hidden gap-12 lg:grid lg:grid-cols-12">
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Dubai communities"
          className="col-span-5 flex flex-col border-t border-line"
          onKeyDown={onKeyDown}
        >
          {items.map((item, i) => {
            const selected = i === active;
            return (
              <button
                key={item.slug}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`community-tab-${item.slug}`}
                aria-selected={selected}
                aria-controls="community-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "group flex items-baseline justify-between gap-6 border-b border-line py-5 text-left transition-colors",
                  selected ? "text-navy" : "text-navy/45 hover:text-navy/80",
                )}
              >
                <span className="serif text-[30px] leading-tight transition-transform duration-300 group-aria-selected:translate-x-2">{item.name}</span>
                <span className={cn("tabular shrink-0 text-[13px] transition-opacity", selected ? "text-gold-deep opacity-100" : "opacity-0")}>
                  {item.listingCount} {item.listingCount === 1 ? "listing" : "listings"}
                </span>
              </button>
            );
          })}
        </div>

        <div id="community-panel" role="tabpanel" aria-labelledby={`community-tab-${current.slug}`} className="col-span-7">
          <div className="relative aspect-[16/11] overflow-hidden rounded-xs bg-navy-800">
            {items.map((item, i) => (
              <Image
                key={item.slug}
                src={item.photo.src}
                alt={item.photo.alt}
                fill
                sizes="(min-width: 1280px) 720px, 58vw"
                className={cn("object-cover transition-opacity duration-700 ease-out", i === active ? "opacity-100" : "opacity-0")}
                aria-hidden={i !== active}
              />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-[1fr_auto] items-start gap-8">
            <div>
              <p className="max-w-[52ch] text-[16.5px] leading-relaxed text-navy-700">{current.intro}</p>
              <p className="mt-2 text-[13.5px] text-slate">Typical homes: {current.propertyStyles.join(", ").toLowerCase()}</p>
            </div>
            <div className="flex flex-col items-end gap-2 text-[14px] font-semibold">
              <Link
                href={`/properties?community=${current.slug}`}
                className="text-navy underline decoration-gold-deep/50 underline-offset-[6px] hover:decoration-gold-deep"
              >
                Properties in {current.name}
              </Link>
              <Link href={`/communities/${current.slug}`} className="font-medium text-slate hover:text-navy">
                Read the community guide
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile and tablet: swipeable cards */}
      <ul className="relative -mx-4 scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:hidden">
        {items.map((item) => (
          <li key={item.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%]">
            <Link href={`/communities/${item.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xs bg-navy-800">
                <Image src={item.photo.src} alt={item.photo.alt} fill sizes="(min-width: 640px) 46vw, 82vw" className="object-cover" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-ivory">
                  <p className="serif text-[26px] leading-tight">{item.name}</p>
                  <p className="mt-1.5 text-[14px] leading-snug text-ivory/80">{item.intro}</p>
                </div>
              </div>
            </Link>
            <Link
              href={`/properties?community=${item.slug}`}
              className="mt-3 inline-block text-[14px] font-semibold text-navy underline decoration-gold-deep/50 underline-offset-4"
            >
              Properties in {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
