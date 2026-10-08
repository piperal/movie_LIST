import { CATEGORIES } from "./validate";

const store = (globalThis.__movies ??= new Map()); // id -> movie

export async function list(userId, category) {
  return [...store.values()].filter(
    (m) => m.userId === userId && (!category || m.category === category)
  );
}

export async function create(userId, { title, year, category }) {
  const movie = {
    id: crypto.randomUUID(),
    userId,
    title,
    year,
    category,
    rating: null,
    notes: null, // new
    createdAt: new Date().toISOString(),
  };
  store.set(movie.id, movie);
  return movie;
}

export async function get(userId, id) {
  const movie = store.get(id);
  return movie && movie.userId === userId ? movie : null; // ownership check
}

export async function update(userId, id, patch) {
  const movie = store.get(id);
  if (!movie || movie.userId !== userId) return null; // ownership check
  Object.assign(movie, patch);
  return movie;
}

export async function remove(userId, id) {
  const movie = store.get(id);
  if (!movie || movie.userId !== userId) return false; // ownership check
  store.delete(id);
  return true;
}

export async function stats(userId) {
  const mine = await list(userId);
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  mine.forEach((m) => counts[m.category]++);

  const rated = mine.filter((m) => m.rating !== null);
  const averageRating = rated.length
    ? Math.round((rated.reduce((s, m) => s + m.rating, 0) / rated.length) * 10) / 10
    : null;

  return { counts, averageRating, ratedCount: rated.length };
}