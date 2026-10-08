import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { validateRating } from "@/lib/validate";
import * as repo from "@/lib/moviesRepo";

export async function PUT(request, { params }) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const { data, error } = validateRating(body?.rating);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const movie = await repo.update(userId, id, { rating: data });
  if (!movie) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(movie);
}