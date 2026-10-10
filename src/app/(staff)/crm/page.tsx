import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CalendarClock, Clock } from "lucide-react";
import { requireStaff } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { getStore } from "@/lib/data";
import { computeDashboard } from "@/lib/crm/metrics";
import { leadIntentLabels } from "@/lib/domain/labels";
import { formatDateTime, formatRelativeDays } from "@/lib/utils";
import { StaffPageHeader } from "@/components/staff/staff-shell";
import { HorizontalBars, WeeklyLeadsChart } from "@/components/staff/charts";
import { Panel, StatTile } from "@/components/staff/ui";
import type { Lead } from "@/lib/domain/types";

export const metadata: Metadata = { title: "Dashboard" };

function FollowUpList({ leads, tone, empty }: { leads: Lead[]; tone: "overdue" | "today" | "upcoming"; empty: string }) {
  if (!leads.length) return <p className="py-2 text-[13px] text-slate">{empty}</p>;
  return (
    <ul className="divide-y divide-line">
      {leads.slice(0, 3).map((l) => (
        <li key={l.id}>
          <Link prefetch={false} href={`/crm/leads/${l.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:bg-mist/60">
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-medium text-navy">{l.name}</span>
              <span className="block text-[12px] text-slate">{leadIntentLabels[l.intent]}</span>
            </span>
            <span className={`shrink-0 text-[12px] font-medium ${tone === "overdue" ? "text-danger" : tone === "today" ? "text-warning" : "text-slate"}`}>
              {formatRelativeDays(l.followUpAt!)}
            </span>
          </Link>
        </li>
      ))}
      {leads.length > 3 ? <li className="pt-2 text-[12px] text-slate">and {leads.length - 3} more</li> : null}
    </ul>
  );
}

export default async function DashboardPage() {
  const user = await requireStaff("/crm");
  const store = getStore();
  const scopeToAgent = !can(user, "leads:view_all");
  const [leads, agents] = await Promise.all([store.leads.list(scopeToAgent && user.agentId ? { visibleToAgentId: user.agentId } : {}), store.agents.list()]);
  const m = computeDashboard(leads, scopeToAgent ? agents.filter((a) => a.id === user.agentId) : agents);
  const pct = (v: number | null) => (v === null ? "—" : `${(v * 100).toFixed(1)}%`);

  return (
    <>
      <StaffPageHeader
        title={scopeToAgent ? `Good to see you, ${user.name.split(" ")[0]}` : "Pipeline overview"}
        description={
          scopeToAgent
            ? `Your leads and unassigned leads from the last ${m.windowDays} days.`
            : `All leads created in the last ${m.windowDays} days, across every source and advisor.`
        }
        demo={m.demoShare > 0}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        <StatTile label="Total leads" value={String(m.total)} sub={`${m.newThisWeek} this week`} href="/crm/leads" />
        <StatTile label="New" value={String(m.byStatus.new)} href="/crm/leads?status=new" />
        <StatTile label="Contacted" value={String(m.byStatus.contacted)} href="/crm/leads?status=contacted" />
        <StatTile label="Qualified" value={String(m.byStatus.qualified)} href="/crm/leads?status=qualified" />
        <StatTile label="Viewing scheduled" value={String(m.byStatus.viewing_scheduled)} href="/crm/leads?status=viewing_scheduled" />
        <StatTile label="Negotiation" value={String(m.byStatus.negotiation)} href="/crm/leads?status=negotiation" />
        <StatTile label="Closed deals" value={String(m.byStatus.closed_won)} sub={`${m.byStatus.closed_lost} lost`} href="/crm/leads?status=closed_won" />
        <StatTile label="Conversion rate" value={pct(m.conversionRate)} sub="Closed deals ÷ all leads" emphasis />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-start">
        <Panel title="New leads per week" description="Last 12 weeks, by date received" className="xl:col-span-2">
          <WeeklyLeadsChart data={m.weekly} />
        </Panel>
        <Panel title="Follow-up reminders" description="Active leads with a follow-up date">
          <div className="space-y-5">
            <div>
              <h3 className="mb-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-danger">
                <AlertTriangle className="size-3.5" aria-hidden /> Overdue ({m.followUps.overdue.length})
              </h3>
              <FollowUpList leads={m.followUps.overdue} tone="overdue" empty="Nothing overdue." />
            </div>
            <div>
              <h3 className="mb-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-warning">
                <Clock className="size-3.5" aria-hidden /> Today ({m.followUps.today.length})
              </h3>
              <FollowUpList leads={m.followUps.today} tone="today" empty="No follow-ups due today." />
            </div>
            <div>
              <h3 className="mb-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-navy-700">
                <CalendarClock className="size-3.5" aria-hidden /> Next 7 days ({m.followUps.upcoming.length})
              </h3>
              <FollowUpList leads={m.followUps.upcoming} tone="upcoming" empty="Nothing scheduled this week." />
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Lead sources" description={`Where leads came from, last ${m.windowDays} days`}>
          {m.sources.length ? (
            <HorizontalBars data={m.sources} label="Leads by source" valueLabel="leads" />
          ) : (
            <p className="text-[13px] text-slate">No leads yet.</p>
          )}
        </Panel>
        <Panel title="Pipeline by stage" description="Current status of leads in the period" action={{ href: "/crm/leads", label: "Open leads" }}>
          <HorizontalBars data={m.pipeline} label="Leads by pipeline stage" valueLabel="leads" />
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-start">
        <Panel title={scopeToAgent ? "Your performance" : "Agent performance"} description="Leads assigned in the period" className="xl:col-span-2">
          <div className="relative -mx-5 overflow-x-auto sm:-mx-6">
            <table className="w-full min-w-[560px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-y border-line bg-mist/70 text-[12px] text-slate">
                  <th scope="col" className="px-5 py-2.5 font-medium sm:px-6">
                    Advisor
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">
                    Assigned
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">
                    Active
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">
                    Reached viewing
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">
                    Closed deals
                  </th>
                  <th scope="col" className="px-5 py-2.5 text-right font-medium sm:px-6">
                    Win rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {m.agents.map((row) => (
                  <tr key={row.agent.id} className="border-b border-line">
                    <th scope="row" className="px-5 py-3 font-normal sm:px-6">
                      <Link prefetch={false} href={`/crm/leads?agent=${row.agent.id}`} className="font-medium text-navy hover:underline">
                        {row.agent.name}
                      </Link>
                      <span className="block text-[12px] text-slate">{row.agent.title}</span>
                    </th>
                    <td className="tabular px-3 py-3 text-right">{row.assigned}</td>
                    <td className="tabular px-3 py-3 text-right">{row.active}</td>
                    <td className="tabular px-3 py-3 text-right">{row.viewings}</td>
                    <td className="tabular px-3 py-3 text-right">{row.won}</td>
                    <td className="tabular px-5 py-3 text-right sm:px-6">{pct(row.conversion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[12px] text-slate">
            Win rate is closed deals ÷ closed leads (won and lost). {m.unassigned ? `${m.unassigned} active leads are unassigned.` : ""}
          </p>
        </Panel>
        <Panel title="Recent activity" action={{ href: "/crm/leads", label: "All leads" }}>
          <ol className="space-y-3.5">
            {m.recentActivity.map((a) => (
              <li key={a.id} className="flex gap-3 text-[13px]">
                <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold-deep" />
                <span className="min-w-0">
                  <Link prefetch={false} href={`/crm/leads/${a.leadId}`} className="font-medium text-navy hover:underline">
                    {a.leadName}
                  </Link>
                  <span className="text-navy-700">: {a.description}</span>
                  <span className="block text-[11.5px] text-slate">
                    {formatDateTime(a.at)}
                    {a.actorName ? `, ${a.actorName}` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <p className="mt-8 text-[12px] text-slate">Figures cover leads visible to your account. Scores and metrics are calculated from the records shown here.</p>
    </>
  );
}
