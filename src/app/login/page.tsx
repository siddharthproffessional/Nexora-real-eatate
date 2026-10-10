import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { pagePhotos } from "@/config/media";
import { Logo } from "@/components/brand/logo";
import { getCurrentUser } from "@/lib/auth/guard";
import { DEMO_ACCOUNTS, demoAccountsEnabled } from "@/lib/auth/accounts";
import { env, supabaseConfigured } from "@/lib/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ next?: string; signedOut?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, signedOut } = await searchParams;
  if (await getCurrentUser()) redirect("/crm");

  // Development convenience only: show the default demo credentials when they are in use.
  const showDemoHint = !env.isProduction && !supabaseConfigured() && demoAccountsEnabled();
  const hints = showDemoHint ? DEMO_ACCOUNTS.filter((a) => !process.env[a.envVar]).map((a) => ({ role: a.role, email: a.email, password: a.devDefault })) : [];

  return (
    <main id="main" className="grid min-h-dvh lg:grid-cols-2">
      <div className="on-dark relative hidden overflow-hidden bg-navy lg:block">
        <Image src={pagePhotos.login.src} alt="" fill priority sizes="50vw" className="object-cover opacity-45" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-navy/20" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-ivory">
          <p className="display max-w-[16ch] text-[2.8rem]">Every inquiry, viewing and deal in one place.</p>
          <p className="mt-4 max-w-[44ch] text-[15.5px] text-ivory/75">The Nexora platform for advisors and administrators.</p>
        </div>
      </div>
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" className="self-start" aria-label="Back to the Nexora website">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="serif text-[34px] leading-tight text-navy">Staff sign in</h1>
          <p className="mt-2 text-[15px] text-slate">Access is limited to Nexora administrators and agents.</p>
          {signedOut ? (
            <p role="status" className="mt-6 rounded-sm bg-success-soft px-3.5 py-3 text-[14px] text-success">
              You have been signed out.
            </p>
          ) : null}
          <LoginForm next={next} />
          {hints.length ? (
            <div className="mt-8 rounded-sm border border-dashed border-gold-deep/50 bg-white p-4 text-[13px] leading-relaxed text-navy-700">
              <p className="font-semibold text-navy">Demo accounts (development only)</p>
              <ul className="mt-2 space-y-1.5">
                {hints.map((h) => (
                  <li key={h.email}>
                    <span className="font-medium capitalize">{h.role}:</span> {h.email} / <span className="tabular">{h.password}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-slate">Set DEMO_ADMIN_PASSWORD and DEMO_AGENT_PASSWORD to change these. They are never shown in production.</p>
            </div>
          ) : null}
        </div>
        <p className="text-[12.5px] text-slate">
          <Link href="/" className="hover:text-navy">
            Return to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
