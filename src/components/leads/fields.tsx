"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Checkbox, Field, Input, Label, Select } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { dialCodes } from "@/lib/domain/countries";
import { contactMethodLabels } from "@/lib/domain/labels";
import { CONTACT_METHODS } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import type { SubmitState } from "./use-lead-submit";

export function ContactFields({ idPrefix, errors, compact = false }: { idPrefix: string; errors: Record<string, string>; compact?: boolean }) {
  return (
    <>
      <Field id={`${idPrefix}-name`} label="Full name" error={errors.name}>
        {(a) => <Input {...a} name="name" autoComplete="name" required maxLength={120} />}
      </Field>
      <Field id={`${idPrefix}-email`} label="Email" error={errors.email}>
        {(a) => <Input {...a} name="email" type="email" autoComplete="email" inputMode="email" required maxLength={200} />}
      </Field>
      <div className={cn("flex flex-col gap-1.5", compact ? "" : "sm:col-span-2 lg:col-span-1")}>
        <Label htmlFor={`${idPrefix}-phone`}>Phone</Label>
        <div className="flex gap-2">
          <div className="w-[124px] shrink-0">
            <Select
              name="phoneCountry"
              aria-label="Country code"
              defaultValue="+971"
              autoComplete="tel-country-code"
              aria-invalid={errors.phoneCountry ? true : undefined}
            >
              {dialCodes.map((d) => (
                <option key={d.code} value={d.code} label={`${d.code} ${d.short}`}>
                  {d.code} {d.label}
                </option>
              ))}
            </Select>
          </div>
          <Input
            id={`${idPrefix}-phone`}
            name="phoneNumber"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            required
            maxLength={20}
            aria-invalid={errors.phoneNumber ? true : undefined}
            aria-describedby={errors.phoneNumber ? `${idPrefix}-phone-error` : undefined}
          />
        </div>
        {errors.phoneNumber ? (
          <p id={`${idPrefix}-phone-error`} className="text-xs font-medium text-danger">
            {errors.phoneNumber}
          </p>
        ) : null}
      </div>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-[13px] font-medium text-navy-700">Preferred contact method</legend>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {CONTACT_METHODS.map((m, i) => (
            <label
              key={m}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-sm border border-line-strong bg-white px-3.5 text-[14px] has-[:checked]:border-navy has-[:checked]:bg-navy has-[:checked]:text-ivory has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-deep"
            >
              <input type="radio" name="contactMethod" value={m} defaultChecked={i === 1} className="sr-only" />
              {contactMethodLabels[m]}
            </label>
          ))}
        </div>
        {errors.contactMethod ? <p className="text-xs font-medium text-danger">{errors.contactMethod}</p> : null}
      </fieldset>
    </>
  );
}

export function ConsentFields({ idPrefix, errors }: { idPrefix: string; errors: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Checkbox
          id={`${idPrefix}-consent`}
          name="consentPrivacy"
          required
          aria-invalid={errors.consentPrivacy ? true : undefined}
          aria-describedby={errors.consentPrivacy ? `${idPrefix}-consent-error` : undefined}
        />
        <label htmlFor={`${idPrefix}-consent`} className="text-[13.5px] leading-relaxed text-navy-700">
          I agree that Nexora may use my details to respond to this request, as described in the{" "}
          <Link href="/privacy" className="font-medium text-gold-deep underline underline-offset-2" target="_blank">
            privacy policy
          </Link>
          .
        </label>
      </div>
      {errors.consentPrivacy ? (
        <p id={`${idPrefix}-consent-error`} className="-mt-1 pl-[30px] text-xs font-medium text-danger">
          {errors.consentPrivacy}
        </p>
      ) : null}
      <div className="flex items-start gap-3">
        <Checkbox id={`${idPrefix}-marketing`} name="consentMarketing" />
        <label htmlFor={`${idPrefix}-marketing`} className="text-[13.5px] leading-relaxed text-navy-700">
          Send me occasional market updates and new listings. I can unsubscribe at any time.
        </label>
      </div>
    </div>
  );
}

/** Invisible to people; bots that fill every field are rejected. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

export function SubmitRow({ state, label, className }: { state: SubmitState; label: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {state.status === "error" ? (
        <p role="alert" className="flex items-start gap-2 rounded-sm bg-danger-soft px-3.5 py-3 text-[13.5px] text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.message}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={state.status === "submitting"} className="w-full sm:w-auto sm:self-start">
        {state.status === "submitting" ? "Sending…" : label}
      </Button>
    </div>
  );
}

const channelNames = { email: "Email alert to the team", whatsapp: "WhatsApp alert to the team", crm_webhook: "External CRM sync" } as const;

export function SuccessPanel({
  state,
  onReset,
  title = "Request received",
}: {
  state: Extract<SubmitState, { status: "success" }>;
  onReset?: () => void;
  title?: string;
}) {
  const firstName = state.name.split(" ")[0];
  const method = state.contactMethod === "whatsapp" ? "on WhatsApp" : state.contactMethod === "email" ? "by email" : "by phone";
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <CheckCircle2 className="size-9 text-success" aria-hidden strokeWidth={1.5} />
      <h3 className="serif text-[28px] leading-tight text-navy">{title}</h3>
      <p className="max-w-[48ch] text-[15.5px] leading-relaxed text-navy-700">
        Thank you, {firstName}. Your details have been saved and an advisor will contact you {method}.
      </p>
      {state.demo ? (
        <div className="rounded-sm border border-dashed border-gold-deep/50 bg-ivory px-4 py-3.5 text-[13px] leading-relaxed text-navy-700">
          <p className="font-semibold text-navy">Demo environment</p>
          <p className="mt-1">
            This request was stored in the demo CRM (reference <span className="tabular font-medium">{state.leadId.slice(-8)}</span>).
          </p>
          {state.deliveries ? (
            <ul className="mt-2 space-y-1">
              {state.deliveries.map((d) => (
                <li key={d.channel}>
                  {channelNames[d.channel]}:{" "}
                  <span className={d.status === "sent" ? "text-success" : d.status === "failed" ? "text-danger" : "text-slate"}>
                    {d.status === "sent" ? "sent" : d.status === "failed" ? "failed" : "not configured, nothing was sent"}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {onReset ? (
        <button type="button" onClick={onReset} className="self-start text-[14px] font-semibold text-gold-deep underline underline-offset-4">
          Send another request
        </button>
      ) : null}
    </div>
  );
}
