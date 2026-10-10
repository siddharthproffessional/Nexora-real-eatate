import type { Agent, Lead, LeadActivity, LeadSource, LeadStatus } from "@/lib/domain/types";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/domain/types";
import { leadSourceLabels, leadStatusLabels } from "@/lib/domain/labels";

const DAY = 86_400_000;
const ACTIVE: LeadStatus[] = ["new", "contacted", "qualified", "viewing_scheduled", "negotiation"];
const REACHED_VIEWING: LeadStatus[] = ["viewing_scheduled", "negotiation", "closed_won"];

export function isActive(lead: Lead) {
  return ACTIVE.includes(lead.status);
}

export interface DashboardMetrics {
  windowDays: number;
  total: number;
  byStatus: Record<LeadStatus, number>;
  conversionRate: number | null;
  newThisWeek: number;
  weekly: { weekStart: string; label: string; count: number }[];
  sources: { source: LeadSource; label: string; count: number }[];
  pipeline: { status: LeadStatus; label: string; count: number }[];
  agents: { agent: Agent; assigned: number; active: number; viewings: number; won: number; conversion: number | null }[];
  unassigned: number;
  recentActivity: (LeadActivity & { leadId: string; leadName: string })[];
  followUps: { overdue: Lead[]; today: Lead[]; upcoming: Lead[] };
  demoShare: number;
}

function startOfWeek(d: Date) {
  // Weeks start on Monday, in UTC — adequate for a weekly trend line.
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (x.getUTCDay() + 6) % 7;
  x.setUTCDate(x.getUTCDate() - day);
  return x;
}

export function computeDashboard(leads: Lead[], agents: Agent[], now = new Date(), windowDays = 90): DashboardMetrics {
  const inWindow = leads.filter((l) => now.getTime() - new Date(l.createdAt).getTime() <= windowDays * DAY);

  const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>;
  for (const l of inWindow) byStatus[l.status]++;

  const won = byStatus.closed_won;
  const conversionRate = inWindow.length ? won / inWindow.length : null;

  // Weekly trend: last 12 weeks including the current one.
  const thisWeek = startOfWeek(now);
  const weekly = Array.from({ length: 12 }, (_, i) => {
    const start = new Date(thisWeek.getTime() - (11 - i) * 7 * DAY);
    const end = new Date(start.getTime() + 7 * DAY);
    const count = leads.filter((l) => {
      const t = new Date(l.createdAt).getTime();
      return t >= start.getTime() && t < end.getTime();
    }).length;
    return {
      weekStart: start.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(start),
      count,
    };
  });

  const sources = LEAD_SOURCES.map((s) => ({ source: s, label: leadSourceLabels[s], count: inWindow.filter((l) => l.source === s).length }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);

  const pipeline = (["new", "contacted", "qualified", "viewing_scheduled", "negotiation", "closed_won"] as LeadStatus[]).map((s) => ({
    status: s,
    label: leadStatusLabels[s],
    count: byStatus[s],
  }));

  const agentRows = agents.map((agent) => {
    const mine = inWindow.filter((l) => l.agentId === agent.id);
    const w = mine.filter((l) => l.status === "closed_won").length;
    const closed = mine.filter((l) => l.status === "closed_won" || l.status === "closed_lost").length;
    return {
      agent,
      assigned: mine.length,
      active: mine.filter(isActive).length,
      viewings: mine.filter((l) => REACHED_VIEWING.includes(l.status)).length,
      won: w,
      conversion: closed ? w / closed : null,
    };
  });

  const recentActivity = leads
    .flatMap((l) => l.activity.map((a) => ({ ...a, leadId: l.id, leadName: l.name })))
    .filter((a) => a.type !== "notification")
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 12);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart.getTime() + DAY);
  const weekAhead = new Date(todayStart.getTime() + 8 * DAY);
  const withFollowUp = leads.filter((l) => l.followUpAt && isActive(l)).sort((a, b) => a.followUpAt!.localeCompare(b.followUpAt!));
  const followUps = {
    overdue: withFollowUp.filter((l) => new Date(l.followUpAt!) < todayStart),
    today: withFollowUp.filter((l) => new Date(l.followUpAt!) >= todayStart && new Date(l.followUpAt!) < todayEnd),
    upcoming: withFollowUp.filter((l) => new Date(l.followUpAt!) >= todayEnd && new Date(l.followUpAt!) < weekAhead),
  };

  return {
    windowDays,
    total: inWindow.length,
    byStatus,
    conversionRate,
    newThisWeek: leads.filter((l) => new Date(l.createdAt) >= thisWeek).length,
    weekly,
    sources,
    pipeline,
    agents: agentRows.sort((a, b) => b.assigned - a.assigned),
    unassigned: inWindow.filter((l) => !l.agentId && isActive(l)).length,
    recentActivity,
    followUps,
    demoShare: leads.length ? leads.filter((l) => l.isDemo).length / leads.length : 0,
  };
}
