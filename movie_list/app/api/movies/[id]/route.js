import { NextResponse } from "next/server";
import { validateStatus } from "@/lib/validate";
import * as repo from "@/lib/moviesRepo";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const { data, error } = validateStatus(body?.movie_status);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const movie = await repo.update(id, { movie_status: data });
  if (!movie) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(movie);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const ok = await repo.remove(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}