import type { Lead } from "@/lib/domain/types";
import { budgetBandLabel, leadIntentLabels, leadSourceLabels } from "@/lib/domain/labels";
import { leadScoringConfig as cfg } from "@/config/lead-scoring";

export interface LeadScore {
  score: number;
  band: "hot" | "warm" | "cool";
  factors: { label: string; points: number }[];
}

export function scoreLead(lead: Lead, now = new Date()): LeadScore {
  const factors: LeadScore["factors"] = [];
  const add = (label: string, points: number) => points > 0 && factors.push({ label, points });

  add(`Intent: ${leadIntentLabels[lead.intent]}`, cfg.intent[lead.intent]);
  if (lead.budgetBand) add(`Budget: ${budgetBandLabel(lead.budgetBand)}`, cfg.budget[lead.budgetBand] ?? 0);
  add(`Source: ${leadSourceLabels[lead.source]}`, cfg.source[lead.source]);
  if (lead.propertyId) add("Asked about a specific property", cfg.linkedProperty);
  if (lead.preferredCommunity) add("Named a preferred community", cfg.preferredCommunity);
  if (lead.message && lead.message.length > 10) add("Left a message", cfg.messageProvided);

  const ageDays = (now.getTime() - new Date(lead.createdAt).getTime()) / 86_400_000;
  const recency = cfg.recency.find((r) => ageDays <= r.withinDays);
  if (recency) add(`Recent inquiry (within ${recency.withinDays} days)`, recency.points);

  const engagement = Math.min(cfg.engagementMax, lead.notes.length * cfg.engagementPerNote);
  add(`Engagement: ${lead.notes.length} logged contact${lead.notes.length === 1 ? "" : "s"}`, engagement);

  const score = Math.max(
    0,
    Math.min(
      100,
      factors.reduce((s, f) => s + f.points, 0),
    ),
  );
  const band = score >= cfg.bands.hot ? "hot" : score >= cfg.bands.warm ? "warm" : "cool";
  return { score, band, factors };
}
