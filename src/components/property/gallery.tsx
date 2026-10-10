"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { PropertyImage } from "@/lib/domain/types";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Listing gallery: editorial mosaic on the page, full-screen viewer with keyboard navigation. */
export function Gallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const count = images.length;

  const show = (i: number) => {
    setIndex(i);
    setOpen(true);
  };
  const go = React.useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  if (count === 0) {
    return <div className="flex aspect-[16/9] items-center justify-center rounded-xs bg-navy-800 text-ivory/60">Photography coming soon</div>;
  }

  const [first, ...rest] = images;
  const current = images[index]!;

  return (
    <>
      <div className="grid gap-2 sm:h-[420px] sm:grid-cols-4 sm:grid-rows-2 lg:h-[540px]">
        <button
          type="button"
          onClick={() => show(0)}
          className="group relative aspect-[4/3] overflow-hidden rounded-xs bg-navy-800 sm:col-span-3 sm:row-span-2 sm:aspect-auto"
          aria-label={`Open gallery, photo 1 of ${count}`}
        >
          <Image
            src={first!.src}
            alt={first!.alt}
            fill
            priority
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          {first!.kind === "visualisation" ? <VisualisationLabel /> : null}
        </button>
        {rest.slice(0, 2).map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => show(i + 1)}
            className="group relative hidden overflow-hidden rounded-xs bg-navy-800 sm:block"
            aria-label={`Open gallery, photo ${i + 2} of ${count}`}
          >
            <Image src={img.src} alt={img.alt} fill sizes="320px" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            {i === 1 && count > 3 ? (
              <span className="absolute inset-0 flex items-center justify-center bg-navy/55 text-[15px] font-semibold text-ivory">
                +{count - 3} {count - 3 === 1 ? "photo" : "photos"}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[13px] text-slate">
        <button type="button" onClick={() => show(0)} className="inline-flex items-center gap-1.5 font-semibold text-navy hover:text-gold-deep">
          <Expand className="size-4" aria-hidden /> View all {count} photos
        </button>
        {first!.credit ? <span>Photo: {first!.credit}</span> : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="on-dark text-ivory">
          <DialogTitle className="sr-only">{title} photos</DialogTitle>
          <DialogDescription className="sr-only">Use the left and right arrow keys to move between photos.</DialogDescription>
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="tabular text-[14px] text-ivory/75" aria-live="polite">
              {index + 1} / {count}
            </p>
            <DialogClose className="inline-flex size-10 items-center justify-center rounded-sm hover:bg-white/10" aria-label="Close gallery">
              <X className="size-5" aria-hidden />
            </DialogClose>
          </div>
          <div className="relative flex-1">
            <Image key={current.src} src={current.src} alt={current.alt} fill sizes="100vw" className="animate-fade object-contain" />
            {current.kind === "visualisation" ? <VisualisationLabel /> : null}
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-navy/60 hover:bg-navy sm:left-6"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-6" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute top-1/2 right-2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-navy/60 hover:bg-navy sm:right-6"
              aria-label="Next photo"
            >
              <ChevronRight className="size-6" aria-hidden />
            </button>
          </div>
          <div className="px-4 py-4 text-center text-[13px] text-ivory/70 sm:px-6">
            {current.alt}
            {current.credit ? <span className="text-ivory/45"> (photo: {current.credit})</span> : null}
          </div>
          <div className="relative scrollbar-none flex gap-2 overflow-x-auto px-4 pb-4 sm:justify-center sm:px-6">
            {images.map((img, i) => (
              <button
                key={img.src + i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative h-14 w-20 shrink-0 overflow-hidden rounded-xs opacity-60 transition-opacity hover:opacity-100",
                  i === index && "opacity-100 ring-2 ring-gold",
                )}
              >
                <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function VisualisationLabel() {
  return <span className="absolute bottom-3 left-3 rounded-xs bg-navy/75 px-2 py-1 text-[11.5px] font-medium text-ivory">Architectural visualisation</span>;
}
