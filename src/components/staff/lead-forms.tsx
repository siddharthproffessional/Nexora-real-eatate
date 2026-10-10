"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { Agent, Lead, LeadStatus, NoteChannel } from "@/lib/domain/types";
import { LEAD_STATUSES, NOTE_CHANNELS } from "@/lib/domain/types";
import { leadStatusLabels, noteChannelLabels } from "@/lib/domain/labels";
import { Field, Select, Textarea, Input } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";

type Feedback = { kind: "ok" | "error"; text: string } | null;

function FeedbackLine({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <p
      role={feedback.kind === "error" ? "alert" : "status"}
      className={`flex items-center gap-1.5 text-[13px] ${feedback.kind === "ok" ? "text-success" : "text-danger"}`}
    >
      {feedback.kind === "ok" ? <CheckCircle2 className="size-4" aria-hidden /> : <AlertCircle className="size-4" aria-hidden />}
      {feedback.text}
    </p>
  );
}

/** Convert an ISO timestamp to the value format of <input type="datetime-local"> in the browser's zone. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LeadManageForm({
  lead,
  agents,
  canEdit,
  canAssign,
  selfAgentId,
}: {
  lead: Lead;
  agents: Agent[];
  canEdit: boolean;
  canAssign: boolean;
  selfAgentId: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = React.useState<LeadStatus>(lead.status);
  const [agentId, setAgentId] = React.useState(lead.agentId ?? "");
  const [followUp, setFollowUp] = React.useState(toLocalInput(lead.followUpAt));
  const [pending, setPending] = React.useState(false);
  const [feedback, setFeedback] = React.useState<Feedback>(null);

  const canClaim = !canAssign && lead.agentId === null && selfAgentId !== null;

  const save = async (patch: Record<string, unknown>) => {
    setPending(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/internal/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        setFeedback({ kind: "error", text: body?.error ?? "Changes were not saved." });
      } else {
        setFeedback({ kind: "ok", text: "Changes saved" });
        router.refresh();
      }
    } catch {
      setFeedback({ kind: "error", text: "Changes were not saved. Check your connection." });
    } finally {
      setPending(false);
    }
  };

  if (!canEdit && !canClaim) {
    return <p className="text-[13.5px] text-slate">This lead is assigned to another advisor. Ask an administrator to reassign it if you need to work on it.</p>;
  }

  if (canClaim) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[13.5px] text-navy-700">This lead is unassigned. Claim it to update its status and add notes.</p>
        <Button onClick={() => save({ agentId: selfAgentId, status: lead.status === "new" ? "contacted" : lead.status })} disabled={pending}>
          {pending ? "Claiming…" : "Assign to me"}
        </Button>
        <FeedbackLine feedback={feedback} />
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const patch: Record<string, unknown> = {};
        if (status !== lead.status) patch.status = status;
        if (canAssign && (agentId || null) !== lead.agentId) patch.agentId = agentId || null;
        const followIso = followUp ? new Date(followUp).toISOString() : null;
        if (followIso !== lead.followUpAt && !(followIso && lead.followUpAt && toLocalInput(lead.followUpAt) === followUp)) patch.followUpAt = followIso;
        if (Object.keys(patch).length === 0) {
          setFeedback({ kind: "ok", text: "No changes to save" });
          return;
        }
        void save(patch);
      }}
    >
      <Field id="lead-status" label="Status">
        {(a) => (
          <Select {...a} value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {leadStatusLabels[s]}
              </option>
            ))}
          </Select>
        )}
      </Field>
      {canAssign ? (
        <Field id="lead-agent" label="Assigned advisor">
          {(a) => (
            <Select {...a} value={agentId} onChange={(e) => setAgentId(e.target.value)}>
              <option key="none" value="">
                Unassigned
              </option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      ) : null}
      <Field id="lead-followup" label="Next follow-up" hint="Leave empty to clear.">
        {(a) => <Input {...a} type="datetime-local" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
      <FeedbackLine feedback={feedback} />
    </form>
  );
}

export function NoteForm({ leadId, disabled }: { leadId: string; disabled: boolean }) {
  const router = useRouter();
  const [channel, setChannel] = React.useState<NoteChannel>("call");
  const [body, setBody] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [feedback, setFeedback] = React.useState<Feedback>(null);

  if (disabled) return <p className="text-[13px] text-slate">Notes can be added by the assigned advisor or an administrator.</p>;

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (body.trim().length < 2) {
          setFeedback({ kind: "error", text: "Write a note before saving." });
          return;
        }
        setPending(true);
        setFeedback(null);
        try {
          const res = await fetch(`/api/internal/leads/${leadId}/notes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channel, body }),
          });
          const json = await res.json().catch(() => null);
          if (!res.ok || !json?.ok) setFeedback({ kind: "error", text: json?.error ?? "Note was not saved." });
          else {
            setBody("");
            setFeedback({ kind: "ok", text: "Note added" });
            router.refresh();
          }
        } catch {
          setFeedback({ kind: "error", text: "Note was not saved. Check your connection." });
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)]">
        <Field id="note-channel" label="Type">
          {(a) => (
            <Select {...a} value={channel} onChange={(e) => setChannel(e.target.value as NoteChannel)}>
              {NOTE_CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {noteChannelLabels[c]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="note-body" label="Note">
          {(a) => (
            <Textarea
              {...a}
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={4000}
              placeholder="What was discussed, what was agreed, what happens next"
            />
          )}
        </Field>
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Add note"}
        </Button>
        <FeedbackLine feedback={feedback} />
      </div>
    </form>
  );
}
