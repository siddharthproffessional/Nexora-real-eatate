"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import type { Agent, Property } from "@/lib/domain/types";
import { FURNISHING_OPTIONS, LISTING_CATEGORIES, LISTING_STATUSES, PROPERTY_TYPES } from "@/lib/domain/types";
import { categoryLabels, furnishingLabels, listingStatusLabels, propertyTypeLabels } from "@/lib/domain/labels";
import { communities } from "@/lib/content/communities";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-md border border-line bg-white p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="text-[15.5px] font-semibold text-navy">{title}</h2>
      {description ? <p className="mt-0.5 text-[12.5px] text-slate">{description}</p> : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/** Create / edit listing form. Server validation (propertyInputSchema) is the source of truth; errors map back to fields. */
export function PropertyForm({ property, agents, isAdmin }: { property?: Property; agents: Agent[]; isAdmin: boolean }) {
  const router = useRouter();
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [message, setMessage] = React.useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, setPending] = React.useState(false);
  const [category, setCategory] = React.useState(property?.category ?? "sale");
  const [segment, setSegment] = React.useState(property?.segment ?? "residential");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    const data: Record<string, unknown> = Object.fromEntries(fd.entries());
    for (const k of ["featured", "published", "offPlanHandoverVerified"]) data[k] = fd.get(k) === "on";
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch(property ? `/api/internal/properties/${property.id}` : "/api/internal/properties", {
        method: property ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        setErrors(body?.fieldErrors ?? {});
        setMessage({ kind: "error", text: body?.error ?? "The listing was not saved." });
        const first = body?.fieldErrors ? Object.keys(body.fieldErrors)[0] : null;
        if (first) (formEl.elements.namedItem(first) as HTMLElement | null)?.focus?.();
        return;
      }
      setErrors({});
      if (!property) {
        router.push(`/admin/properties/${body.property.id}?created=1`);
        return;
      }
      setMessage({ kind: "ok", text: "Listing saved" });
      router.refresh();
    } catch {
      setMessage({ kind: "error", text: "The listing was not saved. Check your connection." });
    } finally {
      setPending(false);
    }
  };

  const p = property;
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      <Section title="Basics">
        <Field
          id="pf-title"
          label="Title"
          error={errors.title}
          hint="Describe the home, not the hype. For example: Two-bedroom apartment with marina views."
          className="sm:col-span-2"
        >
          {(a) => <Input {...a} name="title" defaultValue={p?.title} maxLength={140} required />}
        </Field>
        <Field id="pf-category" label="Listing category" error={errors.category}>
          {(a) => (
            <Select {...a} name="category" value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
              {LISTING_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="pf-segment" label="Segment" error={errors.segment}>
          {(a) => (
            <Select {...a} name="segment" value={segment} onChange={(e) => setSegment(e.target.value as typeof segment)}>
              <option key="residential" value="residential">
                Residential
              </option>
              <option key="commercial" value="commercial">
                Commercial
              </option>
            </Select>
          )}
        </Field>
        <Field id="pf-type" label="Property type" error={errors.type}>
          {(a) => (
            <Select {...a} name="type" defaultValue={p?.type ?? "apartment"}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {propertyTypeLabels[t]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="pf-community" label="Community" error={errors.communitySlug}>
          {(a) => (
            <Select {...a} name="communitySlug" defaultValue={p?.communitySlug ?? ""}>
              <option key="none" value="" disabled>
                Choose a community
              </option>
              {communities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="pf-building" label="Building or project" optional error={errors.building} className="sm:col-span-2">
          {(a) => <Input {...a} name="building" defaultValue={p?.building ?? ""} maxLength={120} />}
        </Field>
      </Section>

      <Section
        title="Price and size"
        description={
          category === "rent" ? "Rent is the annual amount in AED." : category === "off-plan" ? "For off-plan, enter the starting price." : undefined
        }
      >
        <Field id="pf-price" label={category === "rent" ? "Annual rent (AED)" : "Price (AED)"} error={errors.price}>
          {(a) => <Input {...a} name="price" inputMode="numeric" defaultValue={p?.price} required />}
        </Field>
        <Field id="pf-furnishing" label="Furnishing" optional error={errors.furnishing}>
          {(a) => (
            <Select {...a} name="furnishing" defaultValue={p?.furnishing ?? ""}>
              <option key="none" value="">
                Not specified
              </option>
              {FURNISHING_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {furnishingLabels[f]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="pf-beds" label="Bedrooms" hint="0 for a studio or commercial unit" error={errors.bedrooms}>
          {(a) => <Input {...a} name="bedrooms" type="number" min={0} max={20} defaultValue={p?.bedrooms ?? 1} />}
        </Field>
        <Field id="pf-baths" label="Bathrooms" error={errors.bathrooms}>
          {(a) => <Input {...a} name="bathrooms" type="number" min={0} max={20} defaultValue={p?.bathrooms ?? 1} />}
        </Field>
        <Field id="pf-area" label="Built-up area (sq ft)" error={errors.areaSqft}>
          {(a) => <Input {...a} name="areaSqft" inputMode="numeric" defaultValue={p?.areaSqft} />}
        </Field>
        <Field id="pf-plot" label="Plot area (sq ft)" optional error={errors.plotSqft}>
          {(a) => <Input {...a} name="plotSqft" inputMode="numeric" defaultValue={p?.plotSqft ?? ""} />}
        </Field>
      </Section>

      <Section title="Description">
        <Field
          id="pf-summary"
          label="Summary"
          hint="One or two sentences shown on cards and in search results."
          error={errors.summary}
          className="sm:col-span-2"
        >
          {(a) => <Textarea {...a} name="summary" rows={2} maxLength={400} defaultValue={p?.summary} />}
        </Field>
        <Field id="pf-description" label="Full description" hint="One paragraph per line." error={errors.description} className="sm:col-span-2">
          {(a) => <Textarea {...a} name="description" rows={6} defaultValue={p?.description.join("\n")} />}
        </Field>
        <Field id="pf-amenities" label="Features and amenities" hint="Separate with commas." error={errors.amenities} className="sm:col-span-2">
          {(a) => <Textarea {...a} name="amenities" rows={2} defaultValue={p?.amenities.join(", ")} />}
        </Field>
        <div className="flex items-start gap-3 rounded-sm border border-dashed border-line-strong bg-mist/60 p-3 sm:col-span-2">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-slate-light" aria-hidden />
          <p className="text-[12.5px] leading-relaxed text-slate">
            AI description drafting is an integration point. It stays switched off until an AI provider is connected, and drafts will always need human review.
          </p>
          <button type="button" disabled className="ml-auto h-8 shrink-0 cursor-not-allowed rounded-sm border border-line px-3 text-[12.5px] text-slate">
            Draft with AI
          </button>
        </div>
      </Section>

      {category === "off-plan" ? (
        <Section
          title="Off-plan project"
          description="Only enter details supplied by the developer. Handover dates appear on the site only when marked verified."
        >
          <Field id="pf-project" label="Project name" error={errors.offPlanProjectName}>
            {(a) => <Input {...a} name="offPlanProjectName" defaultValue={p?.offPlan?.projectName ?? ""} />}
          </Field>
          <Field id="pf-developer" label="Developer" optional error={errors.offPlanDeveloper}>
            {(a) => <Input {...a} name="offPlanDeveloper" defaultValue={p?.offPlan?.developer ?? ""} />}
          </Field>
          <Field id="pf-handover" label="Handover" optional hint="For example Q4 2028" error={errors.offPlanHandover}>
            {(a) => <Input {...a} name="offPlanHandover" defaultValue={p?.offPlan?.handover?.label ?? ""} />}
          </Field>
          <div className="flex items-start gap-3 self-end pb-2">
            <Checkbox id="pf-handover-verified" name="offPlanHandoverVerified" defaultChecked={p?.offPlan?.handover?.verified ?? false} />
            <label htmlFor="pf-handover-verified" className="text-[13.5px] text-navy-700">
              Handover date verified with the developer
            </label>
          </div>
          <Field id="pf-payment" label="Payment plan" optional error={errors.offPlanPaymentPlan} className="sm:col-span-2">
            {(a) => <Input {...a} name="offPlanPaymentPlan" defaultValue={p?.offPlan?.paymentPlan ?? ""} />}
          </Field>
        </Section>
      ) : null}

      <Section title="Rental yield" description="Leave empty unless you have a reliable, citable source. All three fields are required together.">
        <Field id="pf-yield" label="Gross yield (%)" optional error={errors.yieldPercent}>
          {(a) => <Input {...a} name="yieldPercent" inputMode="decimal" defaultValue={p?.rentalYield?.grossPercent ?? ""} />}
        </Field>
        <Field id="pf-yield-asof" label="As of" optional error={errors.yieldAsOf}>
          {(a) => <Input {...a} name="yieldAsOf" type="date" defaultValue={p?.rentalYield?.asOf ?? ""} />}
        </Field>
        <Field id="pf-yield-source" label="Source" optional error={errors.yieldSource} className="sm:col-span-2">
          {(a) => (
            <Input {...a} name="yieldSource" defaultValue={p?.rentalYield?.source ?? ""} placeholder="e.g. Registered rents for comparable units, DLD data" />
          )}
        </Field>
      </Section>

      <Section
        title="Status and publishing"
        description={isAdmin ? undefined : "Administrators publish listings, feature them and record advertising permits."}
      >
        <Field id="pf-status" label="Listing status" error={errors.status}>
          {(a) => (
            <Select {...a} name="status" defaultValue={p?.status ?? "available"}>
              {LISTING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {listingStatusLabels[s]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {isAdmin ? (
          <>
            <Field id="pf-agent" label="Listing agent" optional error={errors.agentId}>
              {(a) => (
                <Select {...a} name="agentId" defaultValue={p?.agentId ?? ""}>
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
            <Field
              id="pf-permit"
              label="Advertising permit number"
              optional
              hint="Entering a permit marks the listing as verified."
              error={errors.permitNumber}
            >
              {(a) => <Input {...a} name="permitNumber" defaultValue={p?.verification?.permitNumber ?? ""} />}
            </Field>
            {p ? (
              <div className="flex flex-col gap-3 self-end pb-2">
                <label className="flex items-center gap-3 text-[13.5px] text-navy-700">
                  <Checkbox name="published" defaultChecked={p.published} /> Published on the website
                </label>
                {errors.published ? <p className="-mt-2 text-xs font-medium text-danger">{errors.published}</p> : null}
                <label className="flex items-center gap-3 text-[13.5px] text-navy-700">
                  <Checkbox name="featured" defaultChecked={p.featured} /> Featured on the homepage
                </label>
              </div>
            ) : (
              <p className="self-end pb-2 text-[12.5px] text-slate">New listings are saved as drafts. Add photos, then publish.</p>
            )}
          </>
        ) : null}
      </Section>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-4 border-t border-line bg-mist/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-md sm:border">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : property ? "Save listing" : "Create listing"}
        </Button>
        {message ? (
          <p
            role={message.kind === "error" ? "alert" : "status"}
            className={`flex items-center gap-1.5 text-[13px] ${message.kind === "ok" ? "text-success" : "text-danger"}`}
          >
            {message.kind === "ok" ? <CheckCircle2 className="size-4" aria-hidden /> : <AlertCircle className="size-4" aria-hidden />}
            {message.text}
          </p>
        ) : null}
      </div>
    </form>
  );
}
