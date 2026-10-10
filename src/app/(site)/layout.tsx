import { Suspense } from "react";
import { DemoRibbon } from "@/components/site/demo-ribbon";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { FavoritesProvider } from "@/components/site/favorites";
import { AnalyticsScripts, UtmCapture } from "@/components/site/tracking";
import { OrganizationJsonLd } from "@/components/seo/json-ld";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      <a href="#main" className="sr-only z-50 rounded-sm bg-navy px-4 py-2 text-ivory focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <DemoRibbon />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <Suspense fallback={null}>
        <UtmCapture />
      </Suspense>
      <AnalyticsScripts />
      <OrganizationJsonLd />
    </FavoritesProvider>
  );
}
