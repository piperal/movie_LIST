import { getSupabase } from "@/lib/supabase";

const STATUS_TO_DATABASE = {
  want: "Want",
  watching: "Watching",
  watched: "Watched",
};

function fromDatabase(row) {
  const status = String(row.movie_status).trim().toLowerCase();
  const normalizedStatus = status === "want to watch" ? "want" : status;
  if (!Object.hasOwn(STATUS_TO_DATABASE, normalizedStatus)) {
    throw new Error(`Unexpected movie status in Supabase: ${row.movie_status}`);
  }

  return {
    id: String(row.id),
    title: row.movie_name,
    year: row.release_year,
    status: normalizedStatus,
    rating: row.rating,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function toDatabase(movie) {
  const row = {};
  if ("title" in movie) row.movie_name = movie.title;
  if ("year" in movie) row.release_year = movie.year;
  if ("status" in movie) row.movie_status = STATUS_TO_DATABASE[movie.status];
  if ("rating" in movie) row.rating = movie.rating;
  if ("notes" in movie) row.notes = movie.notes;
  return row;
}

async function throwOnError(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export const repo = {
  async list() {
    const data = await throwOnError(
      getSupabase().from("movie_list").select("*").order("created_at", { ascending: false }),
    );
    return data.map(fromDatabase);
  },

  async get(id) {
    const data = await throwOnError(
      getSupabase().from("movie_list").select("*").eq("id", id).maybeSingle(),
    );
    return data ? fromDatabase(data) : null;
  },

  async create(movie) {
    const data = await throwOnError(
      getSupabase().from("movie_list").insert(toDatabase(movie)).select("*").single(),
    );
    return fromDatabase(data);
  },

  async update(id, patch) {
    const data = await throwOnError(
      getSupabase()
        .from("movie_list")
        .update(toDatabase(patch))
        .eq("id", id)
        .select("*")
        .maybeSingle(),
    );
    return data ? fromDatabase(data) : null;
  },

  async remove(id) {
    const data = await throwOnError(
      getSupabase().from("movie_list").delete().eq("id", id).select("id").maybeSingle(),
    );
    return Boolean(data);
  },
};
