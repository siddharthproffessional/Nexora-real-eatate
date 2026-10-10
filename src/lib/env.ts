import "server-only";

/**
 * Server-side environment access and integration status.
 * Nothing in this module is ever sent to the browser except the derived status labels shown to admins.
 */

const v = (name: string) => {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : undefined;
};

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  dataBackend: (v("DATA_BACKEND") === "supabase" ? "supabase" : "demo") as "demo" | "supabase",
  demoDataDir: v("DEMO_DATA_DIR"),
  supabase: {
    url: v("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: v("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: v("SUPABASE_SERVICE_ROLE_KEY"),
    bucket: v("SUPABASE_STORAGE_BUCKET") ?? "property-media",
  },
  resend: {
    apiKey: v("RESEND_API_KEY"),
    from: v("EMAIL_FROM"),
    to: v("LEAD_NOTIFICATION_EMAIL")
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  },
  whatsapp: {
    publicNumber: v("NEXT_PUBLIC_WHATSAPP_NUMBER"),
    token: v("WHATSAPP_CLOUD_API_TOKEN"),
    phoneNumberId: v("WHATSAPP_PHONE_NUMBER_ID"),
    graphVersion: v("WHATSAPP_GRAPH_API_VERSION") ?? "v21.0",
    notifyTo: v("WHATSAPP_NOTIFY_TO"),
    templateName: v("WHATSAPP_TEMPLATE_NAME"),
    templateLanguage: v("WHATSAPP_TEMPLATE_LANGUAGE") ?? "en",
  },
  crmWebhook: { url: v("CRM_WEBHOOK_URL"), secret: v("CRM_WEBHOOK_SECRET") },
  maps: { googleEmbedKey: v("NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY") },
  analytics: { gaId: v("NEXT_PUBLIC_GA_MEASUREMENT_ID"), plausibleDomain: v("NEXT_PUBLIC_PLAUSIBLE_DOMAIN") },
  ai: { provider: v("AI_PROVIDER"), apiKey: v("AI_API_KEY"), model: v("AI_MODEL") },
  inventoryFeed: { url: v("INVENTORY_FEED_URL"), token: v("INVENTORY_FEED_TOKEN") },
};

export function supabaseConfigured() {
  return env.dataBackend === "supabase" && Boolean(env.supabase.url && env.supabase.serviceRoleKey && env.supabase.anonKey);
}

export type IntegrationState = "active" | "fallback" | "not_configured" | "integration_point";

export interface IntegrationStatus {
  id: string;
  name: string;
  area: "Data" | "Notifications" | "Website" | "AI" | "Inventory";
  state: IntegrationState;
  detail: string;
  envVars: string[];
}

export function getIntegrationStatus(): IntegrationStatus[] {
  const sb = supabaseConfigured();
  const emailReady = Boolean(env.resend.apiKey && env.resend.from && env.resend.to?.length);
  const waAlertsReady = Boolean(env.whatsapp.token && env.whatsapp.phoneNumberId && env.whatsapp.notifyTo && env.whatsapp.templateName);
  return [
    {
      id: "database",
      name: "Database",
      area: "Data",
      state: sb ? "active" : "fallback",
      detail: sb
        ? "Supabase Postgres with row-level security."
        : "Local demo store (JSON file). Data persists on this server only; use Supabase for production.",
      envVars: ["DATA_BACKEND", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
    },
    {
      id: "auth",
      name: "Staff sign-in",
      area: "Data",
      state: sb ? "active" : "fallback",
      detail: sb ? "Supabase Auth accounts with roles from the profiles table." : "Demo staff accounts defined by environment variables.",
      envVars: ["AUTH_SECRET", "DEMO_ADMIN_PASSWORD", "DEMO_AGENT_PASSWORD"],
    },
    {
      id: "media",
      name: "Listing photo storage",
      area: "Data",
      state: sb ? "active" : "fallback",
      detail: sb ? `Supabase Storage bucket "${env.supabase.bucket}".` : "Uploads saved to the local demo store and served by the app.",
      envVars: ["SUPABASE_STORAGE_BUCKET"],
    },
    {
      id: "email",
      name: "Email alerts for new leads",
      area: "Notifications",
      state: emailReady ? "active" : "not_configured",
      detail: emailReady ? `Sent through Resend to ${env.resend.to!.length} inbox(es).` : "No emails are sent. Add a Resend API key, sender and recipient.",
      envVars: ["RESEND_API_KEY", "EMAIL_FROM", "LEAD_NOTIFICATION_EMAIL"],
    },
    {
      id: "whatsapp-alerts",
      name: "WhatsApp alerts for new leads",
      area: "Notifications",
      state: waAlertsReady ? "active" : "not_configured",
      detail: waAlertsReady
        ? "Template message sent through the WhatsApp Business Cloud API."
        : "No WhatsApp alerts are sent. Requires a Cloud API token, phone number ID, recipient and approved template.",
      envVars: ["WHATSAPP_CLOUD_API_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_NOTIFY_TO", "WHATSAPP_TEMPLATE_NAME"],
    },
    {
      id: "crm-webhook",
      name: "External CRM sync",
      area: "Notifications",
      state: env.crmWebhook.url ? "active" : "not_configured",
      detail: env.crmWebhook.url
        ? `Signed JSON webhook to ${new URL(env.crmWebhook.url).host}.`
        : "Leads stay in the built-in CRM only. Add a webhook URL to forward them.",
      envVars: ["CRM_WEBHOOK_URL", "CRM_WEBHOOK_SECRET"],
    },
    {
      id: "whatsapp-chat",
      name: "WhatsApp click-to-chat",
      area: "Website",
      state: env.whatsapp.publicNumber ? "active" : "not_configured",
      detail: env.whatsapp.publicNumber ? "Listing pages open a pre-filled WhatsApp chat." : "WhatsApp buttons are shown as unavailable until a number is set.",
      envVars: ["NEXT_PUBLIC_WHATSAPP_NUMBER"],
    },
    {
      id: "maps",
      name: "Maps",
      area: "Website",
      state: env.maps.googleEmbedKey ? "active" : "fallback",
      detail: env.maps.googleEmbedKey ? "Google Maps Embed API." : "OpenStreetMap embed (no key required). Pins show the community, not the exact unit.",
      envVars: ["NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY"],
    },
    {
      id: "analytics",
      name: "Web analytics",
      area: "Website",
      state: env.analytics.gaId || env.analytics.plausibleDomain ? "active" : "not_configured",
      detail: env.analytics.gaId
        ? "Google Analytics 4."
        : env.analytics.plausibleDomain
          ? "Plausible Analytics."
          : "No third-party analytics loaded. Lead sources and UTM tags are still recorded in the CRM.",
      envVars: ["NEXT_PUBLIC_GA_MEASUREMENT_ID", "NEXT_PUBLIC_PLAUSIBLE_DOMAIN"],
    },
    {
      id: "ai",
      name: "AI services",
      area: "AI",
      state: "integration_point",
      detail:
        "Interfaces and API routes are in place for recommendations, natural-language search, lead qualification, inquiry categorisation, description drafting and market reports. No AI provider adapter is implemented yet, so these features are switched off.",
      envVars: ["AI_PROVIDER", "AI_API_KEY", "AI_MODEL"],
    },
    {
      id: "inventory",
      name: "Property inventory feed",
      area: "Inventory",
      state: "integration_point",
      detail: "An adapter interface for portal or developer feeds is defined. No feed is connected; listings are managed in the admin.",
      envVars: ["INVENTORY_FEED_URL", "INVENTORY_FEED_TOKEN"],
    },
  ];
}
