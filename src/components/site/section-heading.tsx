import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeading({
  id,
  title,
  description,
  action,
  tone = "dark",
  className,
}: {
  id?: string;
  title: string;
  description?: React.ReactNode;
  action?: { href: string; label: string };
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        <h2 id={id} className={cn("display text-[2.1rem] sm:text-[2.75rem]", tone === "light" ? "text-ivory" : "text-navy")}>
          {title}
        </h2>
        {description ? (
          <p className={cn("mt-4 max-w-[60ch] text-[16px] leading-relaxed", tone === "light" ? "text-ivory/75" : "text-slate")}>{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className={cn(
            "shrink-0 text-[14.5px] font-semibold underline underline-offset-[6px] transition-colors",
            tone === "light" ? "text-ivory decoration-gold/60 hover:decoration-gold" : "text-navy decoration-gold-deep/50 hover:decoration-gold-deep",
          )}
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
