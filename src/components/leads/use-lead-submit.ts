"use client";

import * as React from "react";
import { fieldErrors, leadSubmissionSchema } from "@/lib/validation/lead";
import { readUtm, trackEvent } from "@/components/site/tracking";

export interface DeliveryInfo {
  channel: "email" | "whatsapp" | "crm_webhook";
  status: "sent" | "failed" | "not_configured";
  detail: string;
}

export type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; leadId: string; name: string; contactMethod: string; demo: boolean; deliveries: DeliveryInfo[] | null }
  | { status: "error"; message: string };

const BOOLEAN_FIELDS = new Set(["consentPrivacy", "consentMarketing"]);

function formToObject(form: HTMLFormElement) {
  const data = new FormData(form);
  const out: Record<string, unknown> = {};
  for (const [k, v] of data.entries()) {
    if (typeof v !== "string") continue;
    out[k] = BOOLEAN_FIELDS.has(k) ? v === "on" || v === "true" : v;
  }
  for (const k of BOOLEAN_FIELDS) if (!(k in out)) out[k] = false;
  return out;
}

/**
 * Shared submit logic for every lead form: validate in the browser with the same schema the server uses,
 * POST to /api/leads, and report exactly what the server says happened.
 */
export function useLeadSubmit() {
  const [state, setState] = React.useState<SubmitState>({ status: "idle" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = { ...formToObject(form), ...readUtm() };
    const parsed = leadSubmissionSchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      setState({ status: "idle" });
      const first = Object.keys(errs)[0];
      const el = first ? (form.elements.namedItem(first) as HTMLElement | null) : null;
      if (el && "focus" in el) el.focus();
      return;
    }
    setErrors({});
    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        if (body?.fieldErrors) setErrors(body.fieldErrors);
        setState({ status: "error", message: body?.error ?? "We couldn't send your request. Check your connection and try again." });
        return;
      }
      trackEvent("lead_submitted", { source: String(payload.source ?? "") });
      setState({
        status: "success",
        leadId: body.leadId,
        name: String(parsed.data.name),
        contactMethod: parsed.data.contactMethod,
        demo: Boolean(body.demo),
        deliveries: body.deliveries ?? null,
      });
    } catch {
      setState({ status: "error", message: "We couldn't reach our server. Check your connection and try again." });
    }
  };

  const reset = () => {
    setState({ status: "idle" });
    setErrors({});
  };

  return { state, errors, onSubmit, reset };
}
