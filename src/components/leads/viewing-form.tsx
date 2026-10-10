"use client";

import * as React from "react";
import { Field, Select, Textarea, Input } from "@/components/ui/form-controls";
import { viewingTimeSlots } from "@/lib/domain/labels";
import { addDays, dubaiToday } from "@/lib/validation/lead";
import type { ListingCategory } from "@/lib/domain/types";
import { ConsentFields, ContactFields, Honeypot, SubmitRow, SuccessPanel } from "./fields";
import { useLeadSubmit } from "./use-lead-submit";

/** "Schedule a viewing" form on listing pages. Creates a viewing_request lead linked to the property. */
export function ViewingForm({ propertyId, propertyRef, category }: { propertyId: string; propertyRef: string; category: ListingCategory }) {
  const { state, errors, onSubmit, reset } = useLeadSubmit();
  const [mode, setMode] = React.useState<"viewing" | "question">("viewing");
  const today = dubaiToday();
  const intent = category === "rent" ? "rent" : category === "off-plan" ? "invest" : "buy";

  if (state.status === "success") {
    return <SuccessPanel state={state} onReset={reset} title={mode === "viewing" ? "Viewing request received" : "Question received"} />;
  }

  return (
    <div>
      <div role="tablist" aria-label="Request type" className="grid grid-cols-2 rounded-sm bg-ivory-200 p-1 text-[14px] font-semibold">
        {(
          [
            ["viewing", "Book a viewing"],
            ["question", "Ask a question"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={mode === value ? "rounded-xs bg-white py-2 text-navy shadow-[0_1px_2px_rgb(16_27_45/0.12)]" : "py-2 text-slate hover:text-navy"}
          >
            {label}
          </button>
        ))}
      </div>

      <form noValidate onSubmit={onSubmit} className="relative mt-6 grid gap-4">
        <input type="hidden" name="source" value={mode === "viewing" ? "viewing_request" : "property_inquiry"} />
        <input type="hidden" name="propertyId" value={propertyId} />
        <input type="hidden" name="intent" value={intent} />
        <Honeypot />
        {mode === "viewing" ? (
          <div className="grid grid-cols-2 gap-3">
            <Field id="viewing-date" label="Preferred date" error={errors.viewingDate}>
              {(a) => (
                // Cached pages may be rendered on an earlier day than they are viewed; the server re-validates the date range.
                <Input {...a} name="viewingDate" type="date" min={addDays(today, 1)} max={addDays(today, 90)} required suppressHydrationWarning />
              )}
            </Field>
            <Field id="viewing-time" label="Time" error={errors.viewingTimeSlot}>
              {(a) => (
                <Select {...a} name="viewingTimeSlot" defaultValue="">
                  <option key="none" value="" disabled>
                    Choose
                  </option>
                  {viewingTimeSlots.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label.split(" (")[0]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        ) : null}
        <ContactFields idPrefix="viewing" errors={errors} compact />
        <Field
          id="viewing-message"
          label={mode === "viewing" ? "Anything we should know?" : "Your question"}
          optional={mode === "viewing"}
          error={errors.message}
        >
          {(a) => (
            <Textarea
              {...a}
              name="message"
              rows={3}
              maxLength={2000}
              defaultValue={mode === "question" ? `I'd like more information about ${propertyRef}.` : undefined}
              key={mode}
            />
          )}
        </Field>
        <ConsentFields idPrefix="viewing" errors={errors} />
        <SubmitRow state={state} label={mode === "viewing" ? "Request viewing" : "Send question"} className="[&>button]:w-full" />
      </form>
    </div>
  );
}
