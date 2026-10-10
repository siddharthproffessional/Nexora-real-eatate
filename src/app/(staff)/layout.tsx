import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/guard";
import { StaffShell } from "@/components/staff/staff-shell";

export const metadata: Metadata = {
  title: { default: "Platform", template: "%s | Nexora Platform" },
  robots: { index: false, follow: false },
};

// Internal pages always render per request with the signed-in user's data.
export const dynamic = "force-dynamic";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  return <StaffShell user={user}>{children}</StaffShell>;
}
