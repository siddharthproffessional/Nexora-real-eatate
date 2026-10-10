import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,color,border-color,box-shadow] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-navy text-ivory hover:bg-navy-700",
        gold: "bg-gold text-navy hover:bg-gold-light",
        outline: "border border-line-strong bg-white/60 text-navy hover:border-navy hover:bg-white",
        "outline-dark": "on-dark border border-white/25 text-ivory hover:border-gold hover:text-gold-light",
        ghost: "text-navy hover:bg-ivory-200",
        "ghost-dark": "on-dark text-ivory/85 hover:bg-white/8 hover:text-ivory",
        link: "h-auto px-0 text-gold-deep underline-offset-4 hover:underline",
        danger: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        sm: "h-9 rounded-sm px-3.5 text-[13px]",
        md: "h-11 rounded-sm px-5 text-sm",
        lg: "h-13 rounded-sm px-7 text-[15px]",
        icon: "size-10 rounded-sm",
        "icon-sm": "size-8 rounded-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, type, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...(asChild ? {} : { type: type ?? "button" })} {...props} />;
});
Button.displayName = "Button";
