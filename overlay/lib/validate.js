// Field rules shared by POST and PATCH. Keep in sync with API.md.
export const STATUSES = ["want", "watching", "watched"];
const FIELDS = ["title", "year", "status", "rating", "notes"];

// Returns an error message, or null when the body is valid.
export function validateMovie(body, { partial }) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) return "Body must be a JSON object";
  if (!partial || "title" in body) {
    if (typeof body.title !== "string" || body.title.trim().length < 1 || body.title.length > 120)
      return "title must be 1-120 characters";
  }
  if ("year" in body && body.year !== null && !(Number.isInteger(body.year) && body.year >= 1888 && body.year <= 2100))
    return "year must be an integer between 1888 and 2100, or null";
  if ("status" in body && !STATUSES.includes(body.status))
    return "status must be one of: " + STATUSES.join(", ");
  if ("rating" in body && !(Number.isInteger(body.rating) && body.rating >= 0 && body.rating <= 5))
    return "rating must be an integer from 0 to 5";
  if ("notes" in body && (typeof body.notes !== "string" || body.notes.length > 5000))
    return "notes must be a string of at most 5000 characters";
  return null;
}

// Copy only known fields so clients can never set id or createdAt.
export function pickFields(body) {
  const out = {};
  for (const k of FIELDS) if (k in body) out[k] = k === "title" ? body[k].trim() : body[k];
  return out;
}
