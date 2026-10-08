import { createClient } from "@supabase/supabase-js";
import { STATUSES } from "./validate";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const TABLE = "movie_list";
const COLUMNS = "id, movie_name, movie_status";

// an invalid id in the URL (e.g. /api/movies/abc) counts as "not found"
function handle(error) {
  if (!error) return;
  if (error.code === "22P02") return;
  throw error;
}

export async function list(status) {
  let query = supabase.from(TABLE).select(COLUMNS).order("id", { ascending: false });
  if (status) query = query.eq("movie_status", status);
  const { data, error } = await query;
  handle(error);
  return data ?? [];
}

export async function create({ movie_name, movie_status }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ movie_name, movie_status })
    .select(COLUMNS)
    .single();
  handle(error);
  return data;
}

export async function update(id, patch) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();
  handle(error);
  return data;
}

export async function remove(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();
  handle(error);
  return !!data;
}

export async function stats() {
  const all = await list();
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  all.forEach((m) => counts[m.movie_status]++);
  return { counts, total: all.length };
}