"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Field, Input } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, next }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        setError(body?.error ?? "Sign in failed. Try again.");
        setPending(false);
        return;
      }
      router.replace(body.redirect);
      router.refresh();
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
      setPending(false);
    }
  };

  return (
    <form noValidate onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
      <Field id="login-email" label="Work email">
        {(a) => <Input {...a} name="email" type="email" autoComplete="username" required />}
      </Field>
      <Field id="login-password" label="Password">
        {(a) => <Input {...a} name="password" type="password" autoComplete="current-password" required />}
      </Field>
      {error ? (
        <p role="alert" className="flex items-start gap-2 rounded-sm bg-danger-soft px-3.5 py-3 text-[13.5px] text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
