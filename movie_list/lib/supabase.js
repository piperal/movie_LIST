import { createClient } from "@supabase/supabase-js";

let client;

export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Set SUPABASE_URL and SUPABASE_ANON_KEY in movie_list/.env.local");
  }

  if (!client) {
    client = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return client;
}
