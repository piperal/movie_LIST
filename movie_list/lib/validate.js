export const CATEGORIES = ["want_to_watch", "watching", "watched"];

export function validateMovie(body) {
  if (!body || typeof body !== "object") return { error: "Invalid body" };

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (title.length < 1 || title.length > 200)
    return { error: "title must be 1-200 characters" };

  const maxYear = new Date().getFullYear() + 5;
  if (!Number.isInteger(body.year) || body.year < 1888 || body.year > maxYear)
    return { error: `year must be an integer between 1888 and ${maxYear}` };

  if (!CATEGORIES.includes(body.category))
    return { error: `category must be one of: ${CATEGORIES.join(", ")}` };

  return { data: { title, year: body.year, category: body.category } };
}

export function validateCategory(category) {
  return CATEGORIES.includes(category)
    ? { data: category }
    : { error: `category must be one of: ${CATEGORIES.join(", ")}` };
}

export function validateRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5
    ? { data: rating }
    : { error: "rating must be an integer 1-5" };
}

export function validateNotes(notes) {
  if (typeof notes !== "string") return { error: "notes must be a string" };
  const trimmed = notes.trim();
  if (trimmed.length > 1000) return { error: "notes must be at most 1000 characters" };
  return { data: trimmed === "" ? null : trimmed }; // empty string clears the note
}