"use client";

import * as React from "react";
import type { Property } from "@/lib/domain/types";
import { formatAEDCompact } from "@/lib/utils";

/**
 * Small-screen call to action. On phones the enquiry form sits far below the gallery, so a slim bar keeps
 * "Book a viewing" within reach once the visitor has scrolled past the price. Hidden on large screens,
 * where the enquiry card is sticky beside the content.
 */
export function MobileEnquiryBar({ property }: { property: Pick<Property, "price" | "category" | "title"> }) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const target = document.getElementById("enquire");
    const onScroll = () => {
      const pastHeader = window.scrollY > 520;
      const formRect = target?.getBoundingClientRect();
      const formInView = formRect ? formRect.top < window.innerHeight && formRect.bottom > 0 : false;
      const nearFooter = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 320;
      setVisible(pastHeader && !formInView && !nearFooter);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-4 py-3 backdrop-blur transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="tabular min-w-0 text-[15px] font-semibold text-navy">
          {property.category === "off-plan" ? <span className="mr-1 text-[12px] font-normal text-slate">From</span> : null}
          {formatAEDCompact(property.price)}
          {property.category === "rent" ? <span className="ml-1 text-[12px] font-normal text-slate">a year</span> : null}
        </p>
        <a
          href="#enquire"
          tabIndex={visible ? 0 : -1}
          className="inline-flex h-11 shrink-0 items-center rounded-sm bg-navy px-5 text-sm font-medium text-ivory hover:bg-navy-700"
        >
          Book a viewing
        </a>
      </div>
    </div>
  );
}
