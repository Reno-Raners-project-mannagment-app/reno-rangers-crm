import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "reno-rangers-files";

// Server-only client. Used from Server Actions after the app's own auth
// checks have already run — the anon key never reaches the browser here.
export const supabaseStorage = createClient(supabaseUrl, supabaseAnonKey);
