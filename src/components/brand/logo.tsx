import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * Temporary NEXORA wordmark. Replace this component (or swap in an <Image>) when the final identity is ready.
 * The mark is an arched doorway — a nod to regional architecture and to "opening the door" to an opportunity.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 30" aria-hidden className={cn("h-7 w-[22px]", className)} fill="none">
      <path d="M2 29V11C2 5.477 6.477 1 12 1s10 4.477 10 10v18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 29V13.5a4.5 4.5 0 0 1 9 0V29" stroke="var(--color-gold)" strokeWidth="1.6" />
    </svg>
  );
}

export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", tone === "light" ? "text-ivory" : "text-navy", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="serif text-[19px] font-medium tracking-[0.22em]">NEXORA</span>
        <span className={cn("mt-1 text-[9.5px] font-semibold tracking-[0.42em]", tone === "light" ? "text-gold" : "text-gold-deep")}>REALTY</span>
      </span>
      <span className="sr-only">{siteConfig.name}</span>
    </span>
  );
}
