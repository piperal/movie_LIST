import { repo } from "@/lib/store";
import { validateMovie, pickFields } from "@/lib/validate";
import { fail, readJson, serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await repo.list());
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(request) {
  const { body, error } = await readJson(request);
  if (error) return error;
  const message = validateMovie(body, { partial: false });
  if (message) return fail(422, message);
  try {
    return Response.json(await repo.create(pickFields(body)), { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
