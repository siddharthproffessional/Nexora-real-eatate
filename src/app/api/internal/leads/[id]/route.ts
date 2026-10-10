import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/data";
import { requireApiStaff } from "@/lib/auth/guard";
import { canAssignLeadTo, canUpdateLead, canViewLead } from "@/lib/auth/permissions";
import { leadUpdateSchema } from "@/lib/validation/crm";
import { fieldErrors } from "@/lib/validation/lead";
import { forbiddenOrigin, isSameOrigin } from "@/lib/security/request";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await requireApiStaff("crm:view");
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const lead = await getStore().leads.getById(id);
  if (!lead || !canViewLead(auth.user, lead)) return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  return NextResponse.json({ ok: true, lead });
}

/** Update status, assignment or follow-up date. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!isSameOrigin(req)) return forbiddenOrigin();
  const auth = await requireApiStaff("crm:view");
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const store = getStore();
  const lead = await store.leads.getById(id);
  // Hide existence of leads the user cannot see.
  if (!lead || !canViewLead(auth.user, lead)) return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });

  const parsed = leadUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) }, { status: 422 });
  const patch = parsed.data;

  const claiming = patch.agentId !== undefined && patch.agentId !== lead.agentId;
  if (claiming && !canAssignLeadTo(auth.user, lead, patch.agentId ?? null)) {
    return NextResponse.json({ ok: false, error: "You can only assign unassigned leads to yourself." }, { status: 403 });
  }
  if (claiming && patch.agentId) {
    const agent = await store.agents.getById(patch.agentId);
    if (!agent) return NextResponse.json({ ok: false, error: "Unknown advisor", fieldErrors: { agentId: "Choose an advisor" } }, { status: 422 });
  }
  const otherChanges = patch.status !== undefined || patch.followUpAt !== undefined;
  // An agent claiming a lead may set status/follow-up in the same request; otherwise they must own the lead.
  const willOwn = claiming && patch.agentId === auth.user.agentId;
  if (otherChanges && !canUpdateLead(auth.user, lead) && !willOwn) {
    return NextResponse.json({ ok: false, error: "Only the assigned advisor or an administrator can update this lead." }, { status: 403 });
  }

  const updated = await store.leads.update(
    id,
    { ...patch, followUpAt: patch.followUpAt === undefined ? undefined : patch.followUpAt ? new Date(patch.followUpAt).toISOString() : null },
    auth.user,
  );
  return NextResponse.json({ ok: true, lead: updated });
}
