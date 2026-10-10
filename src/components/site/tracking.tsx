"use client";

import * as React from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";

/**
 * First-touch UTM capture. Campaign parameters from the landing URL are kept for the browser session and
 * attached to any inquiry, so the CRM can attribute leads to campaigns without third-party cookies.
 */
const UTM_KEY = "nexora:utm";

export function UtmCapture() {
  const params = useSearchParams();
  React.useEffect(() => {
    const source = params.get("utm_source");
    if (!source) return;
    try {
      if (window.sessionStorage.getItem(UTM_KEY)) return;
      window.sessionStorage.setItem(
        UTM_KEY,
        JSON.stringify({ utmSource: source, utmMedium: params.get("utm_medium") ?? undefined, utmCampaign: params.get("utm_campaign") ?? undefined }),
      );
    } catch {
      /* storage unavailable */
    }
  }, [params]);
  return null;
}

export function readUtm(): Record<string, string | undefined> {
  try {
    const raw = window.sessionStorage.getItem(UTM_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

type Gtag = (...args: unknown[]) => void;
type Plausible = (event: string, opts?: { props?: Record<string, string | number> }) => void;

/** Fire an analytics event if an analytics provider is configured; otherwise a no-op. */
export function trackEvent(name: string, props: Record<string, string | number> = {}) {
  const w = window as unknown as { gtag?: Gtag; plausible?: Plausible };
  w.gtag?.("event", name, props);
  w.plausible?.(name, { props });
}

/** Loads GA4 or Plausible only when configured. */
export function AnalyticsScripts() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (gaId) {
    return (
      <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(gaId)},{anonymize_ip:true});`}
        </Script>
      </>
    );
  }
  if (plausibleDomain) {
    return <Script src="https://plausible.io/js/script.js" data-domain={plausibleDomain} strategy="afterInteractive" />;
  }
  return null;
}
