"use client";

import * as React from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { communities } from "@/lib/content/communities";
import { propertyTypeLabels } from "@/lib/domain/labels";
import { PROPERTY_TYPES } from "@/lib/domain/types";
import { ConsentFields, ContactFields, Honeypot, SubmitRow, SuccessPanel } from "./fields";
import { useLeadSubmit } from "./use-lead-submit";

const timelines = ["As soon as possible", "Within 3 months", "In 3 to 6 months", "Just exploring"];

/** Valuation / listing request from owners who want to sell or lease. */
export function SellLeaseForm() {
  const { state, errors, onSubmit, reset } = useLeadSubmit();
  const [intent, setIntent] = React.useState<"sell" | "lease">("sell");

  if (state.status === "success") return <SuccessPanel state={state} onReset={reset} title="Valuation request received" />;

  return (
    <form noValidate onSubmit={onSubmit} className="relative grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="source" value="sell_lease_form" />
      <Honeypot />
      <fieldset className="sm:col-span-2">
        <legend className="text-[13px] font-medium text-navy-700">I want to</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:max-w-sm">
          {(
            [
              ["sell", "Sell my property"],
              ["lease", "Lease it out"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-sm border border-line-strong bg-white text-[14px] font-medium has-[:checked]:border-navy has-[:checked]:bg-navy has-[:checked]:text-ivory has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-deep"
            >
              <input type="radio" name="intent" value={value} checked={intent === value} onChange={() => setIntent(value)} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <Field id="sell-type" label="Property type" error={errors.sellPropertyType}>
        {(a) => (
          <Select {...a} name="sellPropertyType" defaultValue="">
            <option key="none" value="" disabled>
              Choose a type
            </option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {propertyTypeLabels[t]}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field id="sell-community" label="Community" error={errors.sellCommunity}>
        {(a) => (
          <Select {...a} name="sellCommunity" defaultValue="">
            <option key="none" value="" disabled>
              Choose a community
            </option>
            {communities.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
            <option key="other" value="Other area">
              Another area of Dubai
            </option>
          </Select>
        )}
      </Field>
      <Field id="sell-beds" label="Bedrooms" optional error={errors.sellBedrooms}>
        {(a) => (
          <Select {...a} name="sellBedrooms" defaultValue="">
            <option key="none" value="">
              Not applicable
            </option>
            <option key="0" value="0">
              Studio
            </option>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field id="sell-area" label="Built-up area (sq ft)" optional error={errors.sellAreaSqft}>
        {(a) => <Input {...a} name="sellAreaSqft" inputMode="numeric" placeholder="e.g. 1,450" />}
      </Field>
      <Field
        id="sell-price"
        label={intent === "sell" ? "Price you have in mind (AED)" : "Annual rent you have in mind (AED)"}
        optional
        hint="Leave blank if you would like our view first."
        error={errors.sellExpectedPrice}
      >
        {(a) => <Input {...a} name="sellExpectedPrice" inputMode="numeric" />}
      </Field>
      <Field id="sell-timeline" label="Timeline" optional error={errors.sellTimeline}>
        {(a) => (
          <Select {...a} name="sellTimeline" defaultValue="">
            <option key="none" value="">
              Not sure yet
            </option>
            {timelines.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <ContactFields idPrefix="sell" errors={errors} />
      <Field id="sell-message" label="Anything else we should know?" optional error={errors.message} className="sm:col-span-2">
        {(a) => <Textarea {...a} name="message" rows={3} maxLength={2000} placeholder="Tenancy status, upgrades, service charge, view…" />}
      </Field>
      <div className="sm:col-span-2">
        <ConsentFields idPrefix="sell" errors={errors} />
      </div>
      <SubmitRow state={state} label="Request a valuation" className="sm:col-span-2" />
    </form>
  );
}
