import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const supabaseOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : "";
  } catch {
    return "";
  }
})();

const analyticsScriptHosts = [
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? "https://www.googletagmanager.com" : "",
  process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? "https://plausible.io" : "",
].filter(Boolean);
const analyticsConnectHosts = [
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? "https://*.google-analytics.com https://*.analytics.google.com" : "",
  process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? "https://plausible.io" : "",
].filter(Boolean);

/**
 * Content Security Policy. Next.js inlines small bootstrap scripts, so script-src keeps 'unsafe-inline';
 * move to nonce-based CSP (via proxy.ts) if you need a stricter policy.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${analyticsScriptHosts.join(" ")}`.trim(),
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://images.unsplash.com ${supabaseOrigin}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${analyticsConnectHosts.join(" ")}`.trim(),
  "frame-src https://www.openstreetmap.org https://www.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/media/image-loader.ts",
    qualities: [60, 70, 75, 80, 85],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Internal pages must never be cached by shared caches or indexed.
      {
        source: "/(crm|admin|login)/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
