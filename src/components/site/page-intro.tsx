import Image from "next/image";
import type { Photo } from "@/config/media";
import { cn } from "@/lib/utils";

export function PageIntro({ title, intro, children, className }: { title: string; intro?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("border-b border-line bg-ivory-200/60", className)}>
      <div className="container-page pt-12 pb-12 lg:pt-16 lg:pb-14">
        <h1 className="display max-w-[20ch] text-[2.4rem] sm:text-[3.4rem]">{title}</h1>
        {intro ? <div className="mt-5 max-w-[62ch] text-[16.5px] leading-relaxed text-slate">{intro}</div> : null}
        {children}
      </div>
    </div>
  );
}

/** Full-bleed photograph with the page title set over it. */
export function PhotoHero({ photo, title, intro, children }: { photo: Photo; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <div className="on-dark relative flex min-h-[460px] items-end overflow-hidden bg-navy text-ivory lg:min-h-[560px]">
      <Image src={photo.src} alt={photo.alt} fill priority sizes="100vw" className="animate-settle object-cover" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-navy/10" />
      <div className="relative container-page pt-32 pb-12 lg:pb-16">
        {children}
        <h1 className="display max-w-[18ch] text-[2.6rem] sm:text-[3.8rem] lg:text-[4.4rem]">{title}</h1>
        {intro ? <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ivory/80">{intro}</p> : null}
      </div>
      <p className="absolute right-4 bottom-3 hidden text-[12px] text-ivory/50 sm:block">Photo: {photo.credit}</p>
    </div>
  );
}
