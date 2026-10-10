"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

type Side = "left" | "right" | "bottom";

const sideClasses: Record<Side, string> = {
  right: "inset-y-0 right-0 h-full w-full max-w-md data-[state=open]:animate-[sheet-in-right_320ms_var(--ease-out-quart)]",
  left: "inset-y-0 left-0 h-full w-full max-w-md data-[state=open]:animate-[sheet-in-left_320ms_var(--ease-out-quart)]",
  bottom: "inset-x-0 bottom-0 max-h-[92dvh] w-full rounded-t-lg data-[state=open]:animate-[sheet-in-bottom_320ms_var(--ease-out-quart)]",
};

export function SheetContent({
  side = "right",
  className,
  children,
  closeLabel = "Close",
  tone = "light",
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: Side; closeLabel?: string; tone?: "light" | "dark" }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-navy/55 backdrop-blur-[2px] data-[state=open]:animate-fade" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col overflow-y-auto shadow-float focus:outline-none",
          tone === "dark" ? "on-dark bg-navy text-ivory" : "bg-ivory text-navy",
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-sm transition-colors",
            tone === "dark" ? "text-ivory/80 hover:bg-white/10" : "text-navy hover:bg-ivory-200",
          )}
          aria-label={closeLabel}
        >
          <X className="size-5" aria-hidden />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const Dialog = DialogPrimitive.Root;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-navy-900/90 data-[state=open]:animate-fade" />
      <DialogPrimitive.Content className={cn("fixed inset-0 z-50 flex flex-col focus:outline-none data-[state=open]:animate-fade", className)} {...props}>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
