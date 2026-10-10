import "server-only";
import { supabaseConfigured, env } from "@/lib/env";
import { createDemoStore } from "./demo-store";
import { createSupabaseStore } from "./supabase-store";
import type { DataStore } from "./types";

let store: DataStore | null = null;

/** Returns the configured data backend. Supabase when DATA_BACKEND=supabase and credentials exist; demo store otherwise. */
export function getStore(): DataStore {
  if (store) return store;
  if (env.dataBackend === "supabase") {
    if (!supabaseConfigured()) {
      throw new Error("DATA_BACKEND=supabase but NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY is missing.");
    }
    store = createSupabaseStore();
  } else {
    store = createDemoStore();
  }
  return store;
}

export type { DataStore } from "./types";
