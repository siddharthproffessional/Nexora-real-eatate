import "server-only";
import { createHmac } from "node:crypto";
import type { Lead, Property } from "@/lib/domain/types";
import { budgetBandLabel, contactMethodLabels, leadIntentLabels, leadSourceLabels } from "@/lib/domain/labels";
import { getCommunityName } from "@/lib/content/communities";
import { formatPhone } from "@/lib/domain/countries";
import { env } from "@/lib/env";
import { siteConfig } from "@/config/site";

/**
 * New-lead notifications. Every channel reports what actually happened — "sent", "failed" or
 * "not_configured" — and the result is written to the lead's activity log. Nothing is reported as
 * delivered unless the provider accepted it.
 */

export type DeliveryStatus = "sent" | "failed" | "not_configured";
export interface DeliveryResult {
  channel: "email" | "whatsapp" | "crm_webhook";
  status: DeliveryStatus;
  detail: string;
}

const TIMEOUT_MS = 8000;

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function leadSummaryLines(lead: Lead, property: Property | null) {
  return [
    ["Name", lead.name],
    ["Intent", leadIntentLabels[lead.intent]],
    ["Source", leadSourceLabels[lead.source]],
    ["Email", lead.email],
    ["Phone", formatPhone(lead.phone)],
    ["Preferred contact", contactMethodLabels[lead.contactMethod]],
    ["Budget", budgetBandLabel(lead.budgetBand)],
    ["Community", getCommunityName(lead.preferredCommunity) ?? "Not specified"],
    ...(property ? [["Property", `${property.ref} — ${property.title}`]] : []),
    ...(lead.viewing ? [["Viewing", `${lead.viewing.date} (${lead.viewing.timeSlot})`]] : []),
    ...(lead.message ? [["Message", lead.message]] : []),
  ] as [string, string][];
}

async function sendEmail(lead: Lead, property: Property | null): Promise<DeliveryResult> {
  const { apiKey, from, to } = env.resend;
  if (!apiKey || !from || !to?.length) {
    return { channel: "email", status: "not_configured", detail: "Email alert not sent: email provider is not configured" };
  }
  const lines = leadSummaryLines(lead, property);
  const crmUrl = `${siteConfig.url}/crm/leads/${lead.id}`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        from,
        to,
        subject: `New ${leadIntentLabels[lead.intent].toLowerCase()} lead: ${lead.name}`,
        text: `${lines.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nOpen in CRM: ${crmUrl}`,
        html: `<table cellpadding="6" style="font-family:sans-serif;font-size:14px">${lines
          .map(([k, v]) => `<tr><td style="color:#5c6675">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`)
          .join("")}</table><p><a href="${escapeHtml(crmUrl)}">Open in CRM</a></p>`,
      }),
    });
    if (!res.ok) return { channel: "email", status: "failed", detail: `Email alert failed: provider responded ${res.status}` };
    return { channel: "email", status: "sent", detail: `Email alert accepted by Resend for ${to.length} recipient(s)` };
  } catch (err) {
    return { channel: "email", status: "failed", detail: `Email alert failed: ${(err as Error).name}` };
  }
}

async function sendWhatsApp(lead: Lead): Promise<DeliveryResult> {
  const w = env.whatsapp;
  if (!w.token || !w.phoneNumberId || !w.notifyTo || !w.templateName) {
    return { channel: "whatsapp", status: "not_configured", detail: "WhatsApp alert not sent: WhatsApp Cloud API is not configured" };
  }
  try {
    const res = await fetch(`https://graph.facebook.com/${w.graphVersion}/${w.phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${w.token}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: w.notifyTo.replace(/[^\d]/g, ""),
        type: "template",
        template: {
          name: w.templateName,
          language: { code: w.templateLanguage },
          // Template body expected to have three variables: name, intent, source.
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: lead.name.slice(0, 60) },
                { type: "text", text: leadIntentLabels[lead.intent] },
                { type: "text", text: leadSourceLabels[lead.source] },
              ],
            },
          ],
        },
      }),
    });
    if (!res.ok) return { channel: "whatsapp", status: "failed", detail: `WhatsApp alert failed: API responded ${res.status}` };
    return { channel: "whatsapp", status: "sent", detail: "WhatsApp alert accepted by the Cloud API" };
  } catch (err) {
    return { channel: "whatsapp", status: "failed", detail: `WhatsApp alert failed: ${(err as Error).name}` };
  }
}

async function sendCrmWebhook(lead: Lead, property: Property | null): Promise<DeliveryResult> {
  const { url, secret } = env.crmWebhook;
  if (!url) return { channel: "crm_webhook", status: "not_configured", detail: "External CRM not updated: no webhook configured" };
  const body = JSON.stringify({
    event: "lead.created",
    sentAt: new Date().toISOString(),
    lead: { ...lead, notes: undefined, activity: undefined },
    property: property ? { id: property.id, ref: property.ref, title: property.title, url: `${siteConfig.url}/properties/${property.slug}` } : null,
  });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const headers: Record<string, string> = { "Content-Type": "application/json", "X-Nexora-Timestamp": timestamp };
  if (secret) headers["X-Nexora-Signature"] = `sha256=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
  try {
    const res = await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return { channel: "crm_webhook", status: "failed", detail: `External CRM webhook failed: responded ${res.status}` };
    return { channel: "crm_webhook", status: "sent", detail: "External CRM webhook accepted" };
  } catch (err) {
    return { channel: "crm_webhook", status: "failed", detail: `External CRM webhook failed: ${(err as Error).name}` };
  }
}

export async function dispatchLeadNotifications(lead: Lead, property: Property | null): Promise<DeliveryResult[]> {
  return Promise.all([sendEmail(lead, property), sendWhatsApp(lead), sendCrmWebhook(lead, property)]);
}
