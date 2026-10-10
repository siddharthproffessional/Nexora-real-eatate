import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { getStore } from "@/lib/data";
import { LEAD_SOURCES, LEAD_STATUSES, type LeadSource, type LeadStatus } from "@/lib/domain/types";
import { leadIntentLabels, leadSourceLabels, leadStatusLabels } from "@/lib/domain/labels";
import { scoreLead } from "@/lib/scoring/lead-score";
import { formatDate, formatRelativeDays } from "@/lib/utils";
import { StaffPageHeader } from "@/components/staff/staff-shell";
import { ScoreBadge, StatusBadge } from "@/components/staff/ui";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Leads" };

const PAGE_SIZE = 25;

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function LeadsPage({ searchParams }: Props) {
  const user = await requireStaff("/crm/leads");
  const sp = await searchParams;
  const status = LEAD_STATUSES.includes(sp.status as LeadStatus) ? (sp.status as LeadStatus) : undefined;
  const source = LEAD_SOURCES.includes(sp.source as LeadSource) ? (sp.source as LeadSource) : undefined;
  const agentId = sp.agent && /^[\w-]{1,64}$/.test(sp.agent) ? sp.agent : undefined;
  const q = sp.q?.trim().slice(0, 80) || undefined;
  const sort = sp.sort === "score" ? "score" : "newest";
  const page = Math.max(1, Math.min(200, Number(sp.page) || 1));

  const store = getStore();
  const scoped = !can(user, "leads:view_all") && user.agentId ? user.agentId : undefined;
  const [all, agents] = await Promise.all([store.leads.list({ status, source, agentId, q, visibleToAgentId: scoped }), store.agents.list()]);
  const agentName = new Map(agents.map((a) => [a.id, a.name]));

  const rows = all.map((lead) => ({ lead, score: scoreLead(lead) }));
  if (sort === "score") rows.sort((a, b) => b.score.score - a.score.score);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const visible = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const qs = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status, source, agent: agentId, q, sort: sort === "newest" ? undefined : sort, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return `/crm/leads${s ? `?${s}` : ""}`;
  };

  const hasDemo = all.some((l) => l.isDemo);

  return (
    <>
      <StaffPageHeader
        title="Leads"
        description={scoped ? "Leads assigned to you, plus unassigned leads you can claim." : "Every inquiry from the website, portals, referrals and calls."}
        demo={hasDemo}
      />

      <nav aria-label="Filter by status" className="relative -mx-4 scrollbar-none overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex gap-1.5 border-b border-line">
          {[undefined, ...LEAD_STATUSES].map((s) => {
            const active = s === status;
            return (
              <li key={s ?? "all"}>
                <Link
                  prefetch={false}
                  href={qs({ status: s, page: undefined })}
                  aria-current={active ? "page" : undefined}
                  className={`-mb-px inline-flex border-b-2 px-3 py-2.5 text-[13.5px] whitespace-nowrap ${active ? "border-navy font-semibold text-navy" : "border-transparent text-slate hover:text-navy"}`}
                >
                  {s ? leadStatusLabels[s] : "All"}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form method="get" className="mt-5 flex flex-wrap items-end gap-3" aria-label="Filter leads">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <div className="flex min-w-[220px] flex-1 flex-col gap-1">
          <label htmlFor="lead-q" className="text-[12px] font-medium text-slate">
            Search
          </label>
          <input
            id="lead-q"
            name="q"
            defaultValue={q}
            placeholder="Name, email or phone"
            className="h-10 rounded-sm border border-line-strong bg-white px-3 text-[14px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="lead-source" className="text-[12px] font-medium text-slate">
            Source
          </label>
          <select id="lead-source" name="source" defaultValue={source ?? ""} className="h-10 rounded-sm border border-line-strong bg-white px-3 text-[14px]">
            <option value="">All sources</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {leadSourceLabels[s]}
              </option>
            ))}
          </select>
        </div>
        {!scoped ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="lead-agent" className="text-[12px] font-medium text-slate">
              Advisor
            </label>
            <select id="lead-agent" name="agent" defaultValue={agentId ?? ""} className="h-10 rounded-sm border border-line-strong bg-white px-3 text-[14px]">
              <option value="">All advisors</option>
              <option value="unassigned">Unassigned</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="flex flex-col gap-1">
          <label htmlFor="lead-sort" className="text-[12px] font-medium text-slate">
            Sort
          </label>
          <select id="lead-sort" name="sort" defaultValue={sort} className="h-10 rounded-sm border border-line-strong bg-white px-3 text-[14px]">
            <option value="newest">Newest first</option>
            <option value="score">Highest score first</option>
          </select>
        </div>
        <Button type="submit" size="sm" className="h-10">
          Apply
        </Button>
        {q || source || agentId || sort !== "newest" ? (
          <Link
            prefetch={false}
            href={qs({ q: undefined, source: undefined, agent: undefined, sort: undefined })}
            className="inline-flex h-10 items-center text-[13px] font-semibold text-info"
          >
            Reset
          </Link>
        ) : null}
      </form>

      <p className="mt-5 text-[13px] text-slate" aria-live="polite">
        {rows.length} {rows.length === 1 ? "lead" : "leads"}
      </p>

      {visible.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed border-line-strong bg-white px-6 py-12 text-center">
          <p className="text-[15px] font-semibold text-navy">No leads match these filters</p>
          <p className="mt-1 text-[13.5px] text-slate">Try another status or clear the search.</p>
        </div>
      ) : (
        <div className="relative mt-3 overflow-x-auto rounded-md border border-line bg-white">
          <table className="w-full min-w-[920px] border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line bg-mist/70 text-[12px] text-slate">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Lead
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Intent
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Source
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Score <span className="sr-only">(rules-based, 0 to 100)</span>
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Advisor
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Follow-up
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Received
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ lead, score }) => (
                <tr key={lead.id} className="border-b border-line last:border-b-0 hover:bg-mist/50">
                  <th scope="row" className="px-4 py-3 font-normal">
                    <Link prefetch={false} href={`/crm/leads/${lead.id}`} className="font-semibold text-navy hover:underline">
                      {lead.name}
                    </Link>
                    <span className="block text-[12px] text-slate">
                      {lead.email}
                      {lead.isDemo ? <span className="ml-1.5 text-gold-deep">Demo</span> : null}
                    </span>
                  </th>
                  <td className="px-3 py-3">{leadIntentLabels[lead.intent]}</td>
                  <td className="px-3 py-3 text-navy-700">{leadSourceLabels[lead.source]}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-3 py-3">
                    <ScoreBadge score={score.score} band={score.band} />
                  </td>
                  <td className="px-3 py-3 text-navy-700">
                    {lead.agentId ? (agentName.get(lead.agentId) ?? "Unknown") : <span className="text-slate">Unassigned</span>}
                  </td>
                  <td className="px-3 py-3 text-navy-700">{lead.followUpAt ? formatRelativeDays(lead.followUpAt) : <span className="text-slate">—</span>}</td>
                  <td className="tabular px-4 py-3 whitespace-nowrap text-navy-700">{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 ? (
        <nav aria-label="Pagination" className="mt-5 flex items-center justify-between text-[13.5px]">
          {page > 1 ? (
            <Link prefetch={false} href={qs({ page: String(page - 1) })} className="font-semibold text-navy hover:underline">
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-slate">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link prefetch={false} href={qs({ page: String(page + 1) })} className="font-semibold text-navy hover:underline">
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </>
  );
}
