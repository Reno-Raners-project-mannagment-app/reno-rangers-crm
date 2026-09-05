import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "reno-rangers-files";

// Server-only client. Used from Server Actions after the app's own auth
// checks have already run — the anon key never reaches the browser here.
// Created lazily (not at module load) so a missing env var only breaks the
// upload/delete call sites that actually need it, rather than crashing
// Next.js's build-time page-data collection for every route that transitively
// imports this module.
let client: SupabaseClient | null = null;

export function getSupabaseStorage(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("SUPABASE_URL / SUPABASE_ANON_KEY are not configured");
  }
  client = createClient(url, anonKey);
  return client;
}
