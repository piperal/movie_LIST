import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { validateCategory } from "@/lib/validate";
import * as repo from "@/lib/moviesRepo";

export async function PATCH(request, { params }) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const { data, error } = validateCategory(body?.category);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const movie = await repo.update(userId, id, { category: data });
  if (!movie) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(movie);
}

export async function DELETE(request, { params }) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ok = await repo.remove(userId, id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}