import type { Lead, Property, StaffRole, StaffUser } from "@/lib/domain/types";

/**
 * Role-based access control. Admins manage everything; agents work their own leads and listings.
 * Enforced in API routes and server components (and mirrored by RLS policies in Supabase).
 */

export type Permission =
  | "crm:view"
  | "leads:view_all"
  | "leads:update_any"
  | "leads:assign"
  | "properties:view"
  | "properties:create"
  | "properties:edit_any"
  | "properties:publish"
  | "properties:verify"
  | "integrations:view";

const rolePermissions: Record<StaffRole, readonly Permission[]> = {
  admin: [
    "crm:view",
    "leads:view_all",
    "leads:update_any",
    "leads:assign",
    "properties:view",
    "properties:create",
    "properties:edit_any",
    "properties:publish",
    "properties:verify",
    "integrations:view",
  ],
  agent: ["crm:view", "properties:view", "properties:create"],
};

export function can(user: StaffUser | null | undefined, permission: Permission) {
  return Boolean(user && rolePermissions[user.role].includes(permission));
}

export function canViewLead(user: StaffUser, lead: Lead) {
  return can(user, "leads:view_all") || lead.agentId === null || lead.agentId === user.agentId;
}

export function canUpdateLead(user: StaffUser, lead: Lead) {
  return can(user, "leads:update_any") || (lead.agentId !== null && lead.agentId === user.agentId);
}

/** Agents may claim an unassigned lead for themselves; only admins can assign to others. */
export function canAssignLeadTo(user: StaffUser, lead: Lead, agentId: string | null) {
  if (can(user, "leads:assign")) return true;
  return user.agentId !== null && lead.agentId === null && agentId === user.agentId;
}

export function canEditProperty(user: StaffUser, property: Property) {
  return can(user, "properties:edit_any") || (property.agentId !== null && property.agentId === user.agentId);
}

export const roleLabels: Record<StaffRole, string> = { admin: "Administrator", agent: "Agent" };
