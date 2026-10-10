import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/data";
import { requireApiStaff } from "@/lib/auth/guard";
import { propertyInputSchema } from "@/lib/validation/property";
import { fieldErrors } from "@/lib/validation/lead";
import { forbiddenOrigin, isSameOrigin } from "@/lib/security/request";
import { revalidateListings } from "@/lib/data/revalidate";

/** Create a listing. New listings start unpublished unless an administrator publishes them. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return forbiddenOrigin();
  const auth = await requireApiStaff("properties:create");
  if (!auth.ok) return auth.response;

  const parsed = propertyInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) }, { status: 422 });
  }
  if (parsed.data.agentId && !(await getStore().agents.getById(parsed.data.agentId))) {
    return NextResponse.json({ ok: false, error: "Unknown advisor", fieldErrors: { agentId: "Choose an advisor" } }, { status: 422 });
  }
  if (parsed.data.published) {
    return NextResponse.json(
      { ok: false, error: "Save the listing as a draft and add photos before publishing.", fieldErrors: { published: "Add photos before publishing" } },
      { status: 422 },
    );
  }
  const property = await getStore().properties.create(parsed.data, auth.user);
  revalidateListings();
  return NextResponse.json({ ok: true, property }, { status: 201 });
}
