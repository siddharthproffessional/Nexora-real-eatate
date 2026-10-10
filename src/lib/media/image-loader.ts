/**
 * Image optimisation strategy.
 *
 * - Unsplash (demo photography): resized and re-encoded at the CDN edge via imgix parameters, so the
 *   browser downloads a width-appropriate AVIF/WebP and our server never proxies the bytes.
 * - Supabase Storage (uploaded listing photos): served from the public bucket; the width hint is passed
 *   for caches. Enable Supabase image transformations to resize at the edge.
 * - Local demo uploads (/api/media/...): served as stored; width is passed as a cache-busting hint only.
 *
 * Used by next/image through `images.loaderFile` in next.config.ts.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const q = quality ?? 75;
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(q));
    return url.toString();
  }
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}w=${width}`;
}
