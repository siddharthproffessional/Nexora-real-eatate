import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/data";
import { requireApiStaff } from "@/lib/auth/guard";
import { canEditProperty } from "@/lib/auth/permissions";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, sniffImageType } from "@/lib/validation/property";
import { forbiddenOrigin, isSameOrigin, rateLimit, tooManyRequests } from "@/lib/security/request";
import { revalidateListings } from "@/lib/data/revalidate";
import type { PropertyImage } from "@/lib/domain/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function authorise(req: NextRequest, id: string) {
  if (!isSameOrigin(req)) return { error: forbiddenOrigin() } as const;
  const auth = await requireApiStaff("properties:view");
  if (!auth.ok) return { error: auth.response } as const;
  const property = await getStore().properties.getById(id);
  if (!property) return { error: NextResponse.json({ ok: false, error: "Listing not found" }, { status: 404 }) } as const;
  if (!canEditProperty(auth.user, property)) {
    return { error: NextResponse.json({ ok: false, error: "You can only edit listings assigned to you." }, { status: 403 }) } as const;
  }
  return { user: auth.user, property } as const;
}

/** Upload photos (multipart/form-data, field "files"). JPEG, PNG or WebP up to 6 MB each, verified by file signature. */
export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const a = await authorise(req, id);
  if ("error" in a) return a.error;
  const limit = rateLimit(`upload:${a.user.id}`, 60, 10 * 60_000);
  if (!limit.allowed) return tooManyRequests(limit.retryAfter);

  const form = await req.formData().catch(() => null);
  const files = (form?.getAll("files") ?? []).filter((f): f is File => f instanceof File);
  const alt = String(form?.get("alt") ?? "")
    .trim()
    .slice(0, 160);
  if (!files.length) return NextResponse.json({ ok: false, error: "Choose at least one photo." }, { status: 422 });
  if (files.length > 10) return NextResponse.json({ ok: false, error: "Upload up to 10 photos at a time." }, { status: 422 });

  const store = getStore();
  const images: PropertyImage[] = [];
  for (const file of files) {
    if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ ok: false, error: `${file.name} is larger than 6 MB.` }, { status: 413 });
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = sniffImageType(bytes);
    if (!type) return NextResponse.json({ ok: false, error: `${file.name} is not a JPEG, PNG or WebP image.` }, { status: 415 });
    const saved = await store.media.save({ bytes, contentType: type, extension: ALLOWED_IMAGE_TYPES[type] });
    images.push({ src: saved.src, alt: alt || `${a.property.title} photo`, credit: null, kind: "photo" });
  }
  const property = await store.properties.addImages(id, images);
  revalidateListings();
  return NextResponse.json({ ok: true, property }, { status: 201 });
}

const srcSchema = z.object({ src: z.string().min(1).max(500) });
const reorderSchema = srcSchema.extend({ direction: z.enum(["up", "down"]) });

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const a = await authorise(req, id);
  if ("error" in a) return a.error;
  const parsed = srcSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 422 });
  const property = await getStore().properties.removeImage(id, parsed.data.src);
  revalidateListings();
  return NextResponse.json({ ok: true, property });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const a = await authorise(req, id);
  if ("error" in a) return a.error;
  const parsed = reorderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 422 });
  const property = await getStore().properties.reorderImage(id, parsed.data.src, parsed.data.direction);
  revalidateListings();
  return NextResponse.json({ ok: true, property });
}
