"use client";

import * as React from "react";
import { MapPin, Search } from "lucide-react";
import { communities } from "@/lib/content/communities";
import { cn } from "@/lib/utils";

/**
 * Accessible combobox (WAI-ARIA 1.2 pattern) for "community, building or keyword".
 * Picking a suggestion sets the `community` filter; free text is sent as the keyword `q`,
 * which the results page interprets (e.g. "2 bed marina under 3m").
 */
export function LocationCombobox({
  id,
  communitySlug,
  text,
  onChange,
  className,
  inputClassName,
  placeholder = "Community, building or keyword",
  name,
}: {
  id: string;
  name?: string;
  communitySlug: string;
  text: string;
  onChange: (next: { communitySlug: string; text: string }) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const listId = `${id}-listbox`;

  const query = text.trim().toLowerCase();
  const options = communities.filter((c) => !query || c.name.toLowerCase().includes(query) || c.slug.includes(query.replace(/\s+/g, "-")));
  const selectedName = communities.find((c) => c.slug === communitySlug)?.name;

  const choose = (slug: string) => {
    const c = communities.find((x) => x.slug === slug);
    onChange({ communitySlug: slug, text: c?.name ?? "" });
    setOpen(false);
    setActive(-1);
  };

  return (
    <div className={cn("relative", className)}>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-slate" />
      <input
        id={id}
        name={name}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && options.length > 0}
        aria-controls={listId}
        aria-activedescendant={active >= 0 && options[active] ? `${id}-opt-${options[active]!.slug}` : undefined}
        autoComplete="off"
        value={text}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onChange={(e) => {
          const value = e.target.value;
          // Typing replaces a previously chosen community unless the text still matches it exactly.
          onChange({ communitySlug: selectedName && value === selectedName ? communitySlug : "", text: value });
          setOpen(true);
          setActive(-1);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(options.length - 1, i + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(0, i - 1));
          } else if (e.key === "Enter" && open && active >= 0 && options[active]) {
            e.preventDefault();
            choose(options[active]!.slug);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={cn("w-full bg-transparent pl-6 text-[15px] text-navy placeholder:text-slate-light focus:outline-none", inputClassName)}
      />
      {open && options.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Communities"
          className="absolute top-[calc(100%+12px)] -left-4 z-30 max-h-80 w-[calc(100%+2rem)] min-w-64 overflow-auto rounded-sm border border-line bg-white py-1.5 shadow-float"
        >
          {options.map((c, i) => (
            <li
              key={c.slug}
              id={`${id}-opt-${c.slug}`}
              role="option"
              aria-selected={c.slug === communitySlug}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(c.slug);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn("flex cursor-pointer items-start gap-3 px-4 py-2.5", i === active ? "bg-ivory" : "", c.slug === communitySlug && "font-semibold")}
            >
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-deep" />
              <span className="flex flex-col">
                <span className="text-[14.5px] text-navy">{c.name}</span>
                <span className="text-[12.5px] font-normal text-slate">{c.intro}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
