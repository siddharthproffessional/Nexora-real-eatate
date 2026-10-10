"use client";

import * as React from "react";
import { Field, Select, Textarea } from "@/components/ui/form-controls";
import { budgetBands, leadIntentLabels } from "@/lib/domain/labels";
import { communities } from "@/lib/content/communities";
import { LEAD_INTENTS, type LeadIntent } from "@/lib/domain/types";
import { ConsentFields, ContactFields, Honeypot, SubmitRow, SuccessPanel } from "./fields";
import { useLeadSubmit } from "./use-lead-submit";

/** General consultation request — used on the homepage and the contact page. */
export function ConsultationForm({
  idPrefix = "consult",
  source = "website_consultation",
  defaultIntent = "buy",
  showMessage = false,
  submitLabel = "Request a consultation",
}: {
  idPrefix?: string;
  source?: "website_consultation" | "contact_form";
  defaultIntent?: LeadIntent;
  showMessage?: boolean;
  submitLabel?: string;
}) {
  const { state, errors, onSubmit, reset } = useLeadSubmit();
  const [intent, setIntent] = React.useState<LeadIntent>(defaultIntent);
  const bands = intent === "rent" || intent === "lease" ? budgetBands.rent : budgetBands.sale;

  if (state.status === "success") return <SuccessPanel state={state} onReset={reset} />;

  return (
    <form noValidate onSubmit={onSubmit} className="relative grid gap-5 sm:grid-cols-2" aria-describedby={`${idPrefix}-privacy-note`}>
      <input type="hidden" name="source" value={source} />
      <Honeypot />
      <ContactFields idPrefix={idPrefix} errors={errors} />
      <Field id={`${idPrefix}-intent`} label="I am interested in" error={errors.intent}>
        {(a) => (
          <Select {...a} name="intent" value={intent} onChange={(e) => setIntent(e.target.value as LeadIntent)}>
            {LEAD_INTENTS.map((i) => (
              <option key={i} value={i}>
                {leadIntentLabels[i]}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field
        id={`${idPrefix}-budget`}
        label={intent === "rent" || intent === "lease" ? "Annual rent range" : intent === "sell" ? "Expected value" : "Budget range"}
        optional
        error={errors.budgetBand}
      >
        {(a) => (
          <Select {...a} name="budgetBand" defaultValue="" key={intent === "rent" || intent === "lease" ? "rent" : "sale"}>
            <option key="none" value="">
              Select a range
            </option>
            {bands.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field id={`${idPrefix}-community`} label="Preferred community" optional error={errors.preferredCommunity} className="sm:col-span-2">
        {(a) => (
          <Select {...a} name="preferredCommunity" defaultValue="">
            <option key="none" value="">
              No preference yet
            </option>
            {communities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
            <option key="other" value="other">
              Somewhere else in Dubai
            </option>
          </Select>
        )}
      </Field>
      {showMessage ? (
        <Field id={`${idPrefix}-message`} label="How can we help?" optional error={errors.message} className="sm:col-span-2">
          {(a) => <Textarea {...a} name="message" maxLength={2000} rows={4} />}
        </Field>
      ) : null}
      <div className="sm:col-span-2">
        <ConsentFields idPrefix={idPrefix} errors={errors} />
      </div>
      <SubmitRow state={state} label={submitLabel} className="sm:col-span-2" />
      <p id={`${idPrefix}-privacy-note`} className="text-[12.5px] leading-relaxed text-slate sm:col-span-2">
        Your details are sent over an encrypted connection, used only to respond to you, and never sold.
      </p>
    </form>
  );
}
