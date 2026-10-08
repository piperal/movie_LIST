export const STATUSES = ["want_to_watch", "watching", "watched"];

export function validateMovie(body) {
  if (!body || typeof body !== "object") return { error: "Invalid body" };

  const name = typeof body.movie_name === "string" ? body.movie_name.trim() : "";
  if (name.length < 1 || name.length > 200)
    return { error: "movie_name must be 1-200 characters" };

  if (!STATUSES.includes(body.movie_status))
    return { error: `movie_status must be one of: ${STATUSES.join(", ")}` };

  return { data: { movie_name: name, movie_status: body.movie_status } };
}

export function validateStatus(status) {
  return STATUSES.includes(status)
    ? { data: status }
    : { error: `movie_status must be one of: ${STATUSES.join(", ")}` };
}