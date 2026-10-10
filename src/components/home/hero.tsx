import Image from "next/image";
import Link from "next/link";
import { heroPhoto } from "@/config/media";
import { HeroSearch } from "./hero-search";

const shortcuts = [
  { slug: "downtown-dubai", name: "Downtown Dubai" },
  { slug: "dubai-marina", name: "Dubai Marina" },
  { slug: "palm-jumeirah", name: "Palm Jumeirah" },
  { slug: "dubai-hills-estate", name: "Dubai Hills Estate" },
  { slug: "business-bay", name: "Business Bay" },
];

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="on-dark relative -mt-[73px] flex min-h-[max(720px,100svh)] flex-col overflow-hidden bg-navy text-ivory">
      <div className="absolute inset-0 animate-settle">
        <Image src={heroPhoto.src} alt={heroPhoto.alt} fill priority sizes="100vw" quality={80} className="object-cover object-[60%_center]" />
      </div>
      {/* Scrims keep text legible over any photograph */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-navy/30" />
      <div aria-hidden className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-navy/70 via-navy/20 to-transparent lg:w-2/3" />

      <div className="relative container-page flex flex-1 flex-col justify-end pt-36 pb-10 lg:pb-14">
        <h1 id="hero-title" className="display text-[2.6rem] text-balance text-ivory sm:text-[3.6rem] lg:text-[4.4rem] xl:text-[4.9rem]">
          <span className="block animate-rise">Find More Than a Property.</span>
          <span className="block animate-rise [animation-delay:140ms]">Discover Your Next Opportunity.</span>
        </h1>
        <p className="mt-6 max-w-[46ch] animate-rise text-[17px] leading-relaxed text-ivory/80 [animation-delay:280ms] sm:text-lg">
          Explore exceptional homes and investment opportunities across Dubai, guided by a team that understands your ambitions.
        </p>

        <div className="mt-10 animate-rise [animation-delay:420ms] lg:mt-12">
          <HeroSearch />
          <nav aria-label="Popular communities" className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
            <span className="text-ivory/60">Popular:</span>
            {shortcuts.map((c) => (
              <Link
                key={c.slug}
                href={`/communities/${c.slug}`}
                className="text-ivory/90 underline decoration-gold/50 underline-offset-4 transition-colors hover:text-ivory hover:decoration-gold"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <p className="serif absolute right-4 bottom-3 hidden text-[13px] text-ivory/55 italic lg:block">Downtown Dubai at night</p>
    </section>
  );
}
