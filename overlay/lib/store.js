// Repository layer. The route handlers only use list / get / create / update / remove.
// To move to Postgres, Mongo, SQLite, Prisma or Drizzle, re-implement `repo` with the same
// async methods (return null / false when an id is not found) and nothing else changes.
//
// This default stores everything in ./data/movies.json (override with DATA_FILE).
// It works for local development and a single long-running Node server. It does NOT persist
// on Vercel or other serverless hosts, whose filesystems are read-only or temporary.
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const file = () => path.resolve(process.env.DATA_FILE || path.join(process.cwd(), "data", "movies.json"));

async function readAll() {
  try {
    const list = JSON.parse(await fs.readFile(file(), "utf8"));
    return Array.isArray(list) ? list : [];
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}

async function writeAll(list) {
  const f = file();
  await fs.mkdir(path.dirname(f), { recursive: true });
  const tmp = f + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(list, null, 2));
  await fs.rename(tmp, f); // atomic replace
}

// Serialise read-modify-write cycles. Kept on globalThis so dev hot reloads share one queue.
globalThis.__reelLogQueue ??= Promise.resolve();
function exclusive(fn) {
  const run = globalThis.__reelLogQueue.then(fn);
  globalThis.__reelLogQueue = run.catch(() => {});
  return run;
}

export const repo = {
  list: () => exclusive(readAll),

  get: (id) => exclusive(async () => (await readAll()).find((m) => m.id === id) || null),

  create: (data) => exclusive(async () => {
    const list = await readAll();
    const movie = { title: "", year: null, status: "want", rating: 0, notes: "", ...data,
                    id: randomUUID(), createdAt: new Date().toISOString() };
    list.push(movie);
    await writeAll(list);
    return movie;
  }),

  update: (id, patch) => exclusive(async () => {
    const list = await readAll();
    const movie = list.find((m) => m.id === id);
    if (!movie) return null;
    Object.assign(movie, patch);
    await writeAll(list);
    return movie;
  }),

  remove: (id) => exclusive(async () => {
    const list = await readAll();
    const next = list.filter((m) => m.id !== id);
    if (next.length === list.length) return false;
    await writeAll(next);
    return true;
  }),
};
