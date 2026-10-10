import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone, Sparkles } from "lucide-react";
import { requireStaff } from "@/lib/auth/guard";
import { can, canUpdateLead, canViewLead } from "@/lib/auth/permissions";
import { getStore } from "@/lib/data";
import {
  budgetBandLabel,
  contactMethodLabels,
  leadIntentLabels,
  leadSourceLabels,
  noteChannelLabels,
  viewingTimeSlots,
  propertyTypeLabels,
} from "@/lib/domain/labels";
import { getCommunityName } from "@/lib/content/communities";
import { formatPhone } from "@/lib/domain/countries";
import { scoreLead } from "@/lib/scoring/lead-score";
import { aiFeatures, getAIProvider } from "@/lib/ai";
import { formatAED, formatDate, formatDateTime } from "@/lib/utils";
import { StaffPageHeader } from "@/components/staff/staff-shell";
import { Panel, ScoreBadge, StatusBadge } from "@/components/staff/ui";
import { LeadManageForm, NoteForm } from "@/components/staff/lead-forms";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Lead" };

type Props = { params: Promise<{ id: string }> };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-3 border-b border-line py-2.5 text-[13.5px] last:border-b-0">
      <dt className="text-slate">{label}</dt>
      <dd className="min-w-0 text-navy">{children}</dd>
    </div>
  );
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await requireStaff(`/crm/leads/${id}`);
  const store = getStore();
  const lead = await store.leads.getById(id);
  if (!lead || !canViewLead(user, lead)) notFound();

  const [agents, property] = await Promise.all([store.agents.list(), lead.propertyId ? store.properties.getById(lead.propertyId) : Promise.resolve(null)]);
  const score = scoreLead(lead);
  const agent = lead.agentId ? agents.find((a) => a.id === lead.agentId) : null;
  const waDigits = lead.phone.replace(/\D/g, "");
  const aiReady = getAIProvider() !== null;
  const editable = canUpdateLead(user, lead);

  return (
    <>
      <Link prefetch={false} href="/crm/leads" className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate hover:text-navy">
        <ArrowLeft className="size-4" aria-hidden /> All leads
      </Link>
      <StaffPageHeader
        title={lead.name}
        description={`${leadIntentLabels[lead.intent]} via ${leadSourceLabels[lead.source].toLowerCase()}, received ${formatDateTime(lead.createdAt)}`}
        demo={lead.isDemo}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={lead.status} />
            <span className="inline-flex items-center gap-2 text-[13px] text-slate">
              Score <ScoreBadge score={score.score} band={score.band} />
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Contact">
            <div className="flex flex-wrap gap-2">
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex h-9 items-center gap-2 rounded-sm border border-line-strong px-3 text-[13px] font-medium text-navy hover:border-navy"
              >
                <Phone className="size-4" aria-hidden /> {formatPhone(lead.phone)}
              </a>
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-sm border border-line-strong px-3 text-[13px] font-medium text-navy hover:border-navy"
              >
                <MessageCircle className="size-4" aria-hidden /> WhatsApp
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex h-9 items-center gap-2 rounded-sm border border-line-strong px-3 text-[13px] font-medium text-navy hover:border-navy"
              >
                <Mail className="size-4" aria-hidden /> {lead.email}
              </a>
            </div>
            <dl className="mt-4">
              <Row label="Prefers">{contactMethodLabels[lead.contactMethod]}</Row>
              <Row label="Intent">{leadIntentLabels[lead.intent]}</Row>
              <Row label="Budget">{budgetBandLabel(lead.budgetBand)}</Row>
              <Row label="Community">{getCommunityName(lead.preferredCommunity) ?? "No preference"}</Row>
              <Row label="Source">
                {leadSourceLabels[lead.source]}
                {lead.utm ? (
                  <span className="block text-[12px] text-slate">
                    Campaign: {[lead.utm.source, lead.utm.medium, lead.utm.campaign].filter(Boolean).join(" / ")}
                  </span>
                ) : null}
              </Row>
              <Row label="Consent">
                Privacy policy accepted {formatDate(lead.consent.at)}; marketing {lead.consent.marketing ? "opted in" : "not opted in"}
              </Row>
              {property ? (
                <Row label="Property">
                  <Link prefetch={false} href={`/properties/${property.slug}`} target="_blank" className="font-medium text-info hover:underline">
                    {property.ref}: {property.title}
                  </Link>
                  <span className="block text-[12px] text-slate">{formatAED(property.price)}</span>
                </Row>
              ) : null}
              {lead.viewing ? (
                <Row label="Viewing request">
                  {formatDate(lead.viewing.date)}, {viewingTimeSlots.find((s) => s.value === lead.viewing!.timeSlot)?.label ?? lead.viewing.timeSlot}
                </Row>
              ) : null}
              {lead.sellDetails ? (
                <Row label="Property to list">
                  {[
                    lead.sellDetails.propertyType ? propertyTypeLabels[lead.sellDetails.propertyType] : null,
                    lead.sellDetails.bedrooms != null ? `${lead.sellDetails.bedrooms === 0 ? "studio" : `${lead.sellDetails.bedrooms} bed`}` : null,
                    lead.sellDetails.areaSqft ? `${lead.sellDetails.areaSqft.toLocaleString("en")} sq ft` : null,
                    lead.sellDetails.community,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  {lead.sellDetails.expectedPrice ? (
                    <span className="block text-[12px] text-slate">Owner expectation: {formatAED(lead.sellDetails.expectedPrice)}</span>
                  ) : null}
                  {lead.sellDetails.timeline ? <span className="block text-[12px] text-slate">Timeline: {lead.sellDetails.timeline}</span> : null}
                </Row>
              ) : null}
            </dl>
            {lead.message ? (
              <blockquote className="mt-4 rounded-sm border-l-2 border-gold bg-mist px-4 py-3 text-[14px] leading-relaxed text-navy-700">
                {lead.message}
              </blockquote>
            ) : null}
          </Panel>

          <Panel title="Notes and contact log" description="Calls, messages, meetings and internal notes">
            {lead.notes.length ? (
              <ol className="mb-6 space-y-4">
                {[...lead.notes].reverse().map((n) => (
                  <li key={n.id} className="rounded-sm border border-line px-4 py-3">
                    <p className="flex flex-wrap items-center gap-2 text-[12px] text-slate">
                      <Badge tone="neutral">{noteChannelLabels[n.channel]}</Badge>
                      {n.authorName}, {formatDateTime(n.createdAt)}
                    </p>
                    <p className="mt-2 text-[14px] leading-relaxed whitespace-pre-line text-navy">{n.body}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mb-5 text-[13.5px] text-slate">No notes yet. Log the first contact below.</p>
            )}
            <NoteForm leadId={lead.id} disabled={!editable} />
          </Panel>

          <Panel title="Activity">
            <ol className="relative space-y-4 border-l border-line pl-5">
              {[...lead.activity].reverse().map((a) => (
                <li key={a.id} className="relative text-[13px]">
                  <span
                    aria-hidden
                    className={`absolute top-1.5 -left-[23.5px] size-2 rounded-full ${a.type === "notification" ? "bg-slate-light" : "bg-gold-deep"}`}
                  />
                  <p className="text-navy">{a.description}</p>
                  <p className="text-[11.5px] text-slate">
                    {formatDateTime(a.at)}
                    {a.actorName ? `, ${a.actorName}` : a.type === "notification" ? ", system" : ""}
                  </p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Manage lead">
            <p className="mb-4 text-[13px] text-slate">
              Assigned to <span className="font-semibold text-navy">{agent?.name ?? "nobody yet"}</span>
              {lead.followUpAt ? (
                <>
                  , follow up <span className="font-semibold text-navy">{formatDateTime(lead.followUpAt)}</span>
                </>
              ) : null}
            </p>
            <LeadManageForm lead={lead} agents={agents} canEdit={editable} canAssign={can(user, "leads:assign")} selfAgentId={user.agentId} />
          </Panel>

          <Panel title="Why this score" description="Rules-based and configurable — not a prediction">
            <ul className="space-y-1.5 text-[13px]">
              {score.factors.map((f) => (
                <li key={f.label} className="flex justify-between gap-3">
                  <span className="text-navy-700">{f.label}</span>
                  <span className="tabular font-medium text-navy">+{f.points}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-line pt-3 text-[12px] text-slate">
              Weights are set in src/config/lead-scoring.ts. Use the score to prioritise follow-up order only.
            </p>
          </Panel>

          <Panel title="AI assistance">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-slate-light" aria-hidden />
              <div>
                <p className="text-[13.5px] font-medium text-navy">{aiFeatures["lead-qualification"].name}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-slate">{aiFeatures["lead-qualification"].description}</p>
                <button
                  type="button"
                  disabled
                  className="mt-3 inline-flex h-9 cursor-not-allowed items-center rounded-sm border border-line px-3 text-[13px] text-slate"
                >
                  {aiReady ? "Summarise lead" : "Not connected"}
                </button>
                {!aiReady ? <p className="mt-2 text-[12px] text-slate">No AI provider is connected, so this feature is switched off.</p> : null}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
