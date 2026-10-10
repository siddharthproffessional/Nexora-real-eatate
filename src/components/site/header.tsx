"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { SavedCount } from "./favorites";
import { mainNav, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Site header. On the homepage it sits transparently over the hero photograph and turns solid once the
 * visitor scrolls; elsewhere it is solid from the start.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const overlay = pathname === "/";
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const transparent = overlay && !scrolled && !open;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full transition-[background-color,box-shadow,color] duration-300",
        "border-b",
        transparent ? "on-dark border-transparent bg-transparent text-ivory" : "border-line bg-ivory/95 text-navy backdrop-blur-md",
      )}
    >
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="shrink-0 rounded-xs" aria-label={`${siteConfig.name} home`}>
          <Logo tone={transparent ? "light" : "dark"} />
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-6 text-[14px] font-medium">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative py-2 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100",
                    transparent ? "text-ivory/85 after:bg-gold hover:text-ivory" : "text-navy-700 after:bg-gold-deep hover:text-navy",
                    isActive(item.href) && "after:scale-x-100",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/saved"
            className={cn(
              "relative inline-flex size-10 items-center justify-center rounded-sm transition-colors",
              transparent ? "hover:bg-white/10" : "hover:bg-ivory-200",
            )}
            aria-label="Saved properties"
          >
            <Heart className="size-[19px]" aria-hidden />
            <SavedCount />
          </Link>
          <Button asChild variant={transparent ? "gold" : "primary"} size="md" className="hidden sm:inline-flex">
            <Link href="/contact#advisor">Speak to an advisor</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className={cn("inline-flex size-10 items-center justify-center rounded-sm xl:hidden", transparent ? "hover:bg-white/10" : "hover:bg-ivory-200")}
                aria-label="Open menu"
              >
                <Menu className="size-[22px]" aria-hidden />
              </button>
            </SheetTrigger>
            <SheetContent side="right" tone="dark" closeLabel="Close menu" className="px-6 pt-5 pb-8">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation and contact options</SheetDescription>
              <Logo tone="light" />
              <nav aria-label="Mobile" className="mt-10">
                <ul className="flex flex-col">
                  {mainNav.map((item) => (
                    <li key={item.href} className="border-b border-white/10">
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={cn(
                          "serif flex py-3.5 text-[26px] leading-tight transition-colors hover:text-gold-light",
                          isActive(item.href) ? "text-gold" : "text-ivory",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/insights" onClick={() => setOpen(false)} className="flex py-3.5 text-[15px] text-ivory/70 hover:text-ivory">
                      Market insights
                    </Link>
                  </li>
                </ul>
              </nav>
              <div className="mt-auto flex flex-col gap-3 pt-10">
                <Button asChild variant="gold" size="lg">
                  <Link href="/contact#advisor" onClick={() => setOpen(false)}>
                    Speak to an advisor
                  </Link>
                </Button>
                <a href={siteConfig.contact.phoneHref} className="inline-flex items-center gap-2 text-sm text-ivory/75 hover:text-ivory">
                  <Phone className="size-4" aria-hidden /> {siteConfig.contact.phoneDisplay}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
