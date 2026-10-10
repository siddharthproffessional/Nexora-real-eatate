import type { Property } from "@/lib/domain/types";

/**
 * Property inventory feed integration point.
 *
 * Portals and developers typically publish listings as XML or JSON feeds. Implement an adapter per source,
 * map each external record to the Property model, and upsert through the property repository with
 * `published: false` so staff review every imported listing before it goes live.
 *
 * No adapter is implemented; getInventoryFeed() returns null.
 */

export interface ExternalListing {
  externalId: string;
  source: string;
  raw: unknown;
}

export interface InventoryFeedAdapter {
  name: string;
  fetchListings(since?: Date): Promise<ExternalListing[]>;
  toProperty(listing: ExternalListing): Omit<Property, "id" | "slug" | "createdAt" | "updatedAt" | "published" | "isDemo"> | null;
}

export function getInventoryFeed(): InventoryFeedAdapter | null {
  return null;
}
