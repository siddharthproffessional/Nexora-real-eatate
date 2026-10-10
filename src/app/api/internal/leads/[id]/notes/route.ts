import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/data";
import { requireApiStaff } from "@/lib/auth/guard";
import { canUpdateLead, canViewLead } from "@/lib/auth/permissions";
import { leadNoteSchema } from "@/lib/validation/crm";
import { fieldErrors } from "@/lib/validation/lead";
import { forbiddenOrigin, isSameOrigin } from "@/lib/security/request";

type Ctx = { params: Promise<{ id: string }> };

/** Record a call, message, meeting or internal note against a lead. */
export async function POST(req: NextRequest, { params }: Ctx) {
  if (!isSameOrigin(req)) return forbiddenOrigin();
  const auth = await requireApiStaff("crm:view");
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const store = getStore();
  const lead = await store.leads.getById(id);
  if (!lead || !canViewLead(auth.user, lead)) return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  if (!canUpdateLead(auth.user, lead)) {
    return NextResponse.json({ ok: false, error: "Assign this lead to yourself before adding notes." }, { status: 403 });
  }

  const parsed = leadNoteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Write a note before saving.", fieldErrors: fieldErrors(parsed.error) }, { status: 422 });

  const updated = await store.leads.addNote(id, parsed.data, auth.user);
  return NextResponse.json({ ok: true, lead: updated }, { status: 201 });
}
