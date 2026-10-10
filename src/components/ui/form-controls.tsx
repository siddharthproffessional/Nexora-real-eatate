import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-sm border border-line-strong bg-white text-[15px] text-navy placeholder:text-slate-light transition-colors hover:border-navy-600 focus-visible:border-navy focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-gold-deep disabled:cursor-not-allowed disabled:bg-ivory-200 disabled:text-slate aria-[invalid=true]:border-danger";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type = "text", ...props }, ref) => (
  <input ref={ref} type={type} className={cn(controlBase, "h-11 px-3.5", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, rows = 4, ...props }, ref) => (
  <textarea ref={ref} rows={rows} className={cn(controlBase, "min-h-24 px-3.5 py-3 leading-relaxed", className)} {...props} />
));
Textarea.displayName = "Textarea";

/** Native select — keeps full keyboard, screen reader and mobile picker support. */
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select ref={ref} className={cn(controlBase, "h-11 appearance-none pr-9 pl-3.5", className)} {...props}>
      {children}
    </select>
    <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate" />
  </div>
));
Select.displayName = "Select";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-[13px] font-medium text-navy-700", className)} {...props} />;
}

export const Checkbox = React.forwardRef<HTMLInputElement, Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      "mt-0.5 size-[18px] shrink-0 cursor-pointer rounded-xs border-line-strong accent-navy focus-visible:outline-2 focus-visible:outline-gold-deep",
      className,
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: (aria: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => React.ReactNode;
}

/** Label + control + hint + error, wired with aria attributes. */
export function Field({ id, label, hint, error, optional, className, children }: FieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {optional ? <span className="ml-1 font-normal text-slate">(optional)</span> : null}
      </Label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-slate">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
