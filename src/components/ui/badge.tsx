import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-xs px-2 py-0.5 text-[11.5px] font-semibold leading-5 tracking-[0.01em] whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-ivory-200 text-navy-700",
        navy: "bg-navy text-ivory",
        gold: "bg-gold text-navy",
        outline: "border border-line-strong text-navy-700",
        glass: "bg-navy/70 text-ivory backdrop-blur-sm",
        demo: "border border-dashed border-gold-deep/60 bg-white/85 text-gold-deep",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        danger: "bg-danger-soft text-danger",
        info: "bg-info-soft text-info",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
