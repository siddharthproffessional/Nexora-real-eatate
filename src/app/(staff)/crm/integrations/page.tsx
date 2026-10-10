import type { Metadata } from "next";
import { CheckCircle2, CircleDashed, CircleSlash, Plug } from "lucide-react";
import { requireStaff } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { getIntegrationStatus, type IntegrationState } from "@/lib/env";
import { aiFeatures, type AIFeature } from "@/lib/ai";
import { StaffPageHeader } from "@/components/staff/staff-shell";
import { Panel } from "@/components/staff/ui";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Integrations" };

const stateMeta: Record<IntegrationState, { label: string; tone: "success" | "info" | "neutral" | "warning"; icon: typeof CheckCircle2 }> = {
  active: { label: "Connected", tone: "success", icon: CheckCircle2 },
  fallback: { label: "Working on fallback", tone: "info", icon: CircleDashed },
  not_configured: { label: "Needs credentials", tone: "warning", icon: CircleSlash },
  integration_point: { label: "Integration point only", tone: "neutral", icon: Plug },
};

export default async function IntegrationsPage() {
  const user = await requireStaff("/crm/integrations");
  if (!can(user, "integrations:view")) {
    return (
      <StaffPageHeader
        title="Integrations"
        description="Only administrators can view integration settings. Ask an administrator if something is not working."
      />
    );
  }
  const items = getIntegrationStatus();
  const areas = [...new Set(items.map((i) => i.area))];

  return (
    <>
      <StaffPageHeader
        title="Integrations"
        description="What is connected, what runs on a built-in fallback, and what still needs credentials. Values are read from server environment variables and are never shown here."
      />
      <div className="grid gap-6">
        {areas.map((area) => (
          <Panel key={area} title={area}>
            <ul className="divide-y divide-line">
              {items
                .filter((i) => i.area === area)
                .map((i) => {
                  const meta = stateMeta[i.state];
                  const Icon = meta.icon;
                  return (
                    <li key={i.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_200px]">
                      <div className="flex gap-3">
                        <Icon
                          className={`mt-0.5 size-5 shrink-0 ${i.state === "active" ? "text-success" : i.state === "not_configured" ? "text-warning" : "text-slate"}`}
                          aria-hidden
                        />
                        <div>
                          <p className="text-[14.5px] font-semibold text-navy">{i.name}</p>
                          <p className="mt-1 text-[13.5px] leading-relaxed text-navy-700">{i.detail}</p>
                          <p className="mt-2 flex flex-wrap gap-1.5">
                            {i.envVars.map((v) => (
                              <code key={v} className="rounded-xs bg-mist px-1.5 py-0.5 text-[11.5px] text-navy-700">
                                {v}
                              </code>
                            ))}
                          </p>
                        </div>
                      </div>
                      <div className="md:text-right">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </Panel>
        ))}
        <Panel title="AI modules" description="Planned features with defined interfaces (src/lib/ai). None are active until a provider adapter is implemented.">
          <ul className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(aiFeatures) as AIFeature[]).map((k) => (
              <li key={k} className="rounded-sm border border-line p-4">
                <p className="flex items-center justify-between gap-2 text-[14px] font-semibold text-navy">
                  {aiFeatures[k].name}
                  <Badge tone="neutral">{aiFeatures[k].audience === "public" ? "Website" : "Staff"}</Badge>
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate">{aiFeatures[k].description}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[12.5px] text-slate">
            Live today without AI: rules-based lead scoring with visible reasons, and phrase-based search (&ldquo;2 bed marina under 3m&rdquo;) on the website.
          </p>
        </Panel>
      </div>
    </>
  );
}
