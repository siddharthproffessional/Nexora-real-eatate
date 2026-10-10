import Link from "next/link";
import type { LeadStatus } from "@/lib/domain/types";
import { leadStatusLabels, leadStatusTone } from "@/lib/domain/labels";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0 rounded-md border border-line bg-white p-5 sm:p-6", className)}>
      {title ? (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[15.5px] font-semibold text-navy">{title}</h2>
            {description ? <p className="mt-0.5 text-[12.5px] text-slate">{description}</p> : null}
          </div>
          {action ? (
            <Link prefetch={false} href={action.href} className="shrink-0 text-[13px] font-semibold text-info hover:underline">
              {action.label}
            </Link>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function StatTile({ label, value, sub, href, emphasis }: { label: string; value: string; sub?: string; href?: string; emphasis?: boolean }) {
  const body = (
    <>
      <p className="text-[12.5px] font-medium text-slate">{label}</p>
      <p className={cn("tabular mt-2 text-[30px] leading-none font-semibold tracking-[-0.02em]", emphasis ? "text-gold-deep" : "text-navy")}>{value}</p>
      {sub ? <p className="mt-2 text-[12px] text-slate">{sub}</p> : null}
    </>
  );
  const cls = "block rounded-md border border-line bg-white px-4 py-4 transition-colors";
  return href ? (
    <Link prefetch={false} href={href} className={cn(cls, "hover:border-navy-600")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <Badge tone={leadStatusTone[status]}>{leadStatusLabels[status]}</Badge>;
}

export function ScoreBadge({ score, band }: { score: number; band: "hot" | "warm" | "cool" }) {
  const tone = band === "hot" ? "bg-danger-soft text-danger" : band === "warm" ? "bg-warning-soft text-warning" : "bg-mist text-slate";
  return (
    <span
      className={cn("tabular inline-flex h-6 min-w-9 items-center justify-center rounded-xs px-1.5 text-[12px] font-semibold", tone)}
      title={`Rules-based score: ${band}`}
    >
      {score}
      <span className="sr-only"> ({band})</span>
    </span>
  );
}
