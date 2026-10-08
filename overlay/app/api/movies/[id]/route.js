import { repo } from "@/lib/store";
import { validateMovie, pickFields } from "@/lib/validate";
import { fail, readJson, serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

// In current Next.js versions `params` is a Promise and must be awaited.
export async function PATCH(request, { params }) {
  const { id } = await params;
  const { body, error } = await readJson(request);
  if (error) return error;
  const message = validateMovie(body, { partial: true });
  if (message) return fail(422, message);
  try {
    const movie = await repo.update(id, pickFields(body));
    return movie ? Response.json(movie) : fail(404, "Movie not found");
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  try {
    return (await repo.remove(id)) ? new Response(null, { status: 204 }) : fail(404, "Movie not found");
  } catch (e) {
    return serverError(e);
  }
}
