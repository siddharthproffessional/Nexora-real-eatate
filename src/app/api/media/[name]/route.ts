import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { demoDataDir } from "@/lib/data/demo-store";

export const runtime = "nodejs";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

/** Serves photos uploaded while running on the demo store. (Supabase Storage serves its own files.) */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const match = name.match(/^([0-9a-f-]{36})\.(jpg|png|webp)$/);
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const bytes = await fs.readFile(path.join(demoDataDir(), "uploads", name));
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": TYPES[match[2]!]!,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
