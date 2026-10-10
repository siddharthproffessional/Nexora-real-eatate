import Link from "next/link";
import { isDemoMode } from "@/config/site";

/** Persistent notice that the site contains demonstration content. Hidden when NEXT_PUBLIC_DEMO_MODE=false. */
export function DemoRibbon() {
  if (!isDemoMode) return null;
  return (
    <div className="on-dark relative z-40 bg-navy-900 text-ivory/75">
      <p className="container-page flex min-h-8 items-center justify-center gap-x-2 py-1.5 text-center text-[12.5px] leading-snug">
        <span>
          <span className="font-semibold text-gold">Demonstration site.</span> Listings, prices and figures are illustrative and are not live inventory.
        </span>
        <Link href="/about#about-this-demo" className="hidden underline decoration-ivory/30 underline-offset-2 hover:text-ivory sm:inline">
          About this demo
        </Link>
      </p>
    </div>
  );
}
