import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/data";
import { requireApiStaff } from "@/lib/auth/guard";
import { can, canEditProperty } from "@/lib/auth/permissions";
import { propertyInputSchema } from "@/lib/validation/property";
import { fieldErrors } from "@/lib/validation/lead";
import { forbiddenOrigin, isSameOrigin } from "@/lib/security/request";
import { revalidateListings } from "@/lib/data/revalidate";

type Ctx = { params: Promise<{ id: string }> };

/** Full update of a listing's editable fields. Publishing, featuring, agent and permit fields only apply for administrators. */
export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!isSameOrigin(req)) return forbiddenOrigin();
  const auth = await requireApiStaff("properties:view");
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const store = getStore();
  const existing = await store.properties.getById(id);
  if (!existing) return NextResponse.json({ ok: false, error: "Listing not found" }, { status: 404 });
  if (!canEditProperty(auth.user, existing)) return NextResponse.json({ ok: false, error: "You can only edit listings assigned to you." }, { status: 403 });

  const parsed = propertyInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) }, { status: 422 });
  }
  if (parsed.data.agentId && can(auth.user, "properties:edit_any") && !(await store.agents.getById(parsed.data.agentId))) {
    return NextResponse.json({ ok: false, error: "Unknown advisor", fieldErrors: { agentId: "Choose an advisor" } }, { status: 422 });
  }
  if (parsed.data.published && !existing.published && existing.images.length === 0 && can(auth.user, "properties:publish")) {
    return NextResponse.json(
      { ok: false, error: "Add at least one photo before publishing.", fieldErrors: { published: "Add photos before publishing" } },
      { status: 422 },
    );
  }
  const property = await store.properties.update(id, parsed.data, auth.user);
  revalidateListings();
  return NextResponse.json({ ok: true, property });
}

const publishSchema = z.object({ published: z.boolean() });

/** Publish or unpublish (administrators only). */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!isSameOrigin(req)) return forbiddenOrigin();
  const auth = await requireApiStaff("properties:publish");
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const parsed = publishSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 422 });
  const store = getStore();
  const existing = await store.properties.getById(id);
  if (!existing) return NextResponse.json({ ok: false, error: "Listing not found" }, { status: 404 });
  if (parsed.data.published && existing.images.length === 0) {
    return NextResponse.json({ ok: false, error: "Add at least one photo before publishing." }, { status: 422 });
  }
  const property = await store.properties.setPublished(id, parsed.data.published, auth.user);
  revalidateListings();
  return NextResponse.json({ ok: true, property });
}
