import "server-only";
import { revalidatePath } from "next/cache";

/** Refresh cached public pages after a listing changes (homepage, search pages, listing and community pages). */
export function revalidateListings() {
  revalidatePath("/", "layout");
}
