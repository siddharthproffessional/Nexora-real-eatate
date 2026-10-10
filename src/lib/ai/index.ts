import type { Lead, LeadIntent, Property } from "@/lib/domain/types";
import type { SearchQuery } from "@/lib/search/query";

/**
 * AI integration points.
 *
 * These contracts describe the AI features planned for the platform. No provider adapter is implemented,
 * so getAIProvider() returns null and every caller shows the feature as unavailable. To enable a feature:
 *   1. Implement AIProvider in src/lib/ai/providers/<provider>.ts using the provider's official SDK.
 *   2. Return it from getAIProvider() when AI_PROVIDER / AI_API_KEY are set.
 *   3. Keep humans in the loop: drafts are suggestions, scores need explanations, nothing is auto-sent.
 */

export type AIFeature =
  "recommendations" | "natural-language-search" | "lead-qualification" | "inquiry-categorisation" | "description-drafting" | "market-report";

export const aiFeatures: Record<AIFeature, { name: string; audience: "public" | "staff"; description: string }> = {
  recommendations: {
    name: "Property recommendations",
    audience: "public",
    description: "Suggest listings based on a visitor's searches and saved properties.",
  },
  "natural-language-search": {
    name: "Natural-language search",
    audience: "public",
    description: "Turn free-text requests into structured filters. A rule-based version is live today.",
  },
  "lead-qualification": {
    name: "Lead qualification assistant",
    audience: "staff",
    description: "Summarise a lead's history and suggest qualifying questions.",
  },
  "inquiry-categorisation": { name: "Inquiry categorisation", audience: "staff", description: "Classify incoming messages by intent and urgency for routing." },
  "description-drafting": {
    name: "Listing description drafting",
    audience: "staff",
    description: "Draft a listing description from the property's specifications for staff to edit.",
  },
  "market-report": { name: "Market report generation", audience: "staff", description: "Draft market summaries from verified, cited data sources only." },
};

export interface AIProvider {
  recommendProperties(input: { savedPropertyIds: string[]; recentQueries: Partial<SearchQuery>[]; limit: number }): Promise<string[]>;
  parseSearchQuery(text: string): Promise<Partial<SearchQuery>>;
  qualifyLead(lead: Lead): Promise<{ summary: string; suggestedQuestions: string[] }>;
  categoriseInquiry(message: string): Promise<{ intent: LeadIntent | "other"; urgency: "high" | "normal" | "low"; rationale: string }>;
  draftDescription(property: Property): Promise<string[]>;
  generateMarketReport(input: { communitySlug?: string; sources: { title: string; url: string; excerpt: string }[] }): Promise<string>;
}

export class AINotConfiguredError extends Error {
  constructor(feature: AIFeature) {
    super(`${aiFeatures[feature].name} is not available: no AI provider is connected.`);
    this.name = "AINotConfiguredError";
  }
}

export function getAIProvider(): AIProvider | null {
  // No adapter implemented yet — see the module comment above.
  return null;
}
