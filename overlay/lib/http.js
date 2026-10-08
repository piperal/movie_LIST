// Small helpers so every route returns errors in the same { error } shape.
export const fail = (status, error) => Response.json({ error }, { status });

export async function readJson(request) {
  try { return { body: await request.json() }; } catch { return { error: fail(400, "Invalid JSON") }; }
}

export function serverError(e) {
  console.error(e);
  return fail(500, "Internal server error");
}
