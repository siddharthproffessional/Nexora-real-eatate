import { ExternalLink } from "lucide-react";

/**
 * Map section. Uses the Google Maps Embed API when NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY is set, otherwise an
 * OpenStreetMap embed that needs no key. Demo listings are pinned to the community, not the exact unit.
 */
export function MapEmbed({ lat, lng, label, precision }: { lat: number; lng: number; label: string; precision: "community" | "exact" }) {
  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  const d = precision === "exact" ? 0.008 : 0.02;
  const src = googleKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(googleKey)}&q=${lat},${lng}&zoom=${precision === "exact" ? 16 : 14}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d * 0.6},${lng + d},${lat + d * 0.6}&layer=mapnik&marker=${lat},${lng}`;
  const external = googleKey
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;

  return (
    <figure>
      <div className="relative aspect-[16/9] overflow-hidden rounded-xs border border-line bg-ivory-200">
        <iframe
          title={`Map of ${label}`}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px] text-slate">
        <span>{precision === "community" ? `Approximate location: ${label}. The exact address is shared when you book a viewing.` : label}</span>
        <a href={external} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-navy hover:text-gold-deep">
          Open larger map <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </figcaption>
    </figure>
  );
}
