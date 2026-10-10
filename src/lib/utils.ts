import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const aedFormatter = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });

/** "AED 4,850,000" */
export function formatAED(value: number) {
  return `AED ${aedFormatter.format(value)}`;
}

/** "AED 4.85M", "AED 185K" — for chips and compact UI. */
export function formatAEDCompact(value: number) {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `AED ${m >= 10 ? m.toFixed(1).replace(/\.0$/, "") : m.toFixed(2).replace(/0$/, "").replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) return `AED ${Math.round(value / 1_000)}K`;
  return `AED ${value}`;
}

export function formatNumber(value: number) {
  return aedFormatter.format(value);
}

export function formatArea(sqft: number) {
  return `${aedFormatter.format(sqft)} sq ft`;
}

export function formatBedrooms(beds: number, long = false) {
  if (beds === 0) return "Studio";
  return long ? `${beds} bedroom${beds === 1 ? "" : "s"}` : `${beds} bed${beds === 1 ? "" : "s"}`;
}

export function formatBathrooms(baths: number, long = false) {
  return long ? `${baths} bathroom${baths === 1 ? "" : "s"}` : `${baths} bath${baths === 1 ? "" : "s"}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dubai" });
const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Dubai",
});

export function formatDate(iso: string | Date) {
  return dateFormatter.format(typeof iso === "string" ? new Date(iso) : iso);
}

export function formatDateTime(iso: string | Date) {
  return dateTimeFormatter.format(typeof iso === "string" ? new Date(iso) : iso);
}

/** "3 days ago", "in 2 days", "today" */
export function formatRelativeDays(iso: string, now = new Date()) {
  const d = new Date(iso);
  const startOf = (x: Date) => Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate());
  const diff = Math.round((startOf(d) - startOf(now)) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return diff > 0 ? `In ${diff} days` : `${Math.abs(diff)} days ago`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function absoluteUrl(path: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
