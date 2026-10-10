import type {
  Agent,
  Lead,
  LeadActivity,
  LeadIntent,
  LeadSource,
  LeadStatus,
  ListingStatus,
  NoteChannel,
  Property,
  PropertyImage,
  StaffUser,
} from "@/lib/domain/types";
import type { SearchQuery } from "@/lib/search/query";
import type { SearchResult } from "@/lib/search/filter";
import type { PropertyInput } from "@/lib/validation/property";

/**
 * Repository contracts. The public site, CRM and admin only ever talk to these interfaces, so the backend
 * (demo JSON store today, Supabase in production, or a future in-house API) can be swapped without touching UI.
 */

export interface AdminPropertyFilter {
  q?: string;
  status?: ListingStatus;
  published?: boolean;
  agentId?: string;
}

export type NewLead = Omit<Lead, "id" | "createdAt" | "updatedAt" | "status" | "agentId" | "followUpAt" | "notes" | "activity" | "isDemo"> & {
  agentId?: string | null;
};

export interface LeadListFilter {
  status?: LeadStatus;
  source?: LeadSource;
  intent?: LeadIntent;
  /** Agent id, or "unassigned" */
  agentId?: string;
  q?: string;
  /** Row-level scoping for agents: only leads assigned to this agent or unassigned. */
  visibleToAgentId?: string;
}

export interface LeadPatch {
  status?: LeadStatus;
  agentId?: string | null;
  followUpAt?: string | null;
}

export interface PropertyRepository {
  search(query: SearchQuery): Promise<SearchResult<Property>>;
  getBySlug(slug: string, opts?: { includeUnpublished?: boolean }): Promise<Property | null>;
  getById(id: string): Promise<Property | null>;
  getByIds(ids: string[]): Promise<Property[]>;
  listFeatured(limit: number): Promise<Property[]>;
  listSimilar(property: Property, limit: number): Promise<Property[]>;
  listPublished(): Promise<Property[]>;
  listForAdmin(filter: AdminPropertyFilter): Promise<Property[]>;
  create(input: PropertyInput, actor: StaffUser): Promise<Property>;
  update(id: string, input: PropertyInput, actor: StaffUser): Promise<Property>;
  setPublished(id: string, published: boolean, actor: StaffUser): Promise<Property>;
  addImages(id: string, images: PropertyImage[]): Promise<Property>;
  removeImage(id: string, src: string): Promise<Property>;
  reorderImage(id: string, src: string, direction: "up" | "down"): Promise<Property>;
}

export interface LeadRepository {
  create(input: NewLead): Promise<Lead>;
  list(filter: LeadListFilter): Promise<Lead[]>;
  getById(id: string): Promise<Lead | null>;
  update(id: string, patch: LeadPatch, actor: StaffUser): Promise<Lead>;
  addNote(id: string, note: { channel: NoteChannel; body: string }, actor: StaffUser): Promise<Lead>;
  appendActivity(id: string, activity: Omit<LeadActivity, "id" | "at">): Promise<void>;
}

export interface AgentRepository {
  list(): Promise<Agent[]>;
  getById(id: string): Promise<Agent | null>;
}

export interface MediaStorage {
  /** Persist an uploaded image and return a URL usable in <img src>. */
  save(file: { bytes: Uint8Array; contentType: string; extension: string }): Promise<{ src: string }>;
}

export interface DataStore {
  backend: "demo" | "supabase";
  properties: PropertyRepository;
  leads: LeadRepository;
  agents: AgentRepository;
  media: MediaStorage;
}

export class NotFoundError extends Error {
  constructor(what: string) {
    super(`${what} not found`);
    this.name = "NotFoundError";
  }
}
