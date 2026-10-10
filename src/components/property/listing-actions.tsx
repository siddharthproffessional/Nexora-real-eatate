"use client";

import * as React from "react";
import { Check, Share2 } from "lucide-react";
import { SaveButton } from "@/components/site/favorites";
import { trackEvent } from "@/components/site/tracking";
import { cn } from "@/lib/utils";

export function ShareButton({ title, url, className }: { title: string; url: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);
  const onShare = async () => {
    trackEvent("listing_share");
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title, url });
        return;
      } catch {
        /* cancelled — fall back to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copy this link", url);
    }
  };
  return (
    <button
      type="button"
      onClick={onShare}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-sm border border-line-strong bg-white px-4 text-sm font-medium text-navy transition-colors hover:border-navy",
        className,
      )}
    >
      {copied ? <Check className="size-4 text-success" aria-hidden /> : <Share2 className="size-4" aria-hidden />}
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.7 8.23-8.22 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06a6.73 6.73 0 0 1-3.37-2.94c-.25-.44.25-.41.72-1.36.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.24 3.74 1.58.68 2.2.74 2.99.62.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

/** Click-to-chat with a pre-filled message. Shown as unavailable until a business number is configured. */
export function WhatsAppButton({ message, className }: { message: string; className?: string }) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  if (!number) {
    return (
      <span className={cn("flex flex-col gap-1", className)}>
        <button
          type="button"
          disabled
          aria-describedby="wa-unavailable"
          className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-sm border border-line-strong bg-ivory-200 px-4 text-sm font-medium text-slate"
        >
          <WhatsAppIcon className="size-4" /> WhatsApp inquiry
        </button>
        <span id="wa-unavailable" className="text-[12px] text-slate">
          WhatsApp number not yet configured.
        </span>
      </span>
    );
  }
  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("whatsapp_click")}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#1f7a4d] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#186641]",
        className,
      )}
    >
      <WhatsAppIcon className="size-4" /> WhatsApp inquiry
    </a>
  );
}

export function ListingActions({ propertyId, title, url }: { propertyId: string; title: string; url: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <SaveButton propertyId={propertyId} title={title} variant="inline" />
      <ShareButton title={title} url={url} />
    </div>
  );
}
