import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { validateNotes } from "@/lib/validate";
import * as repo from "@/lib/moviesRepo";

export async function PUT(request, { params }) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const { data, error } = validateNotes(body?.notes);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const movie = await repo.get(userId, id);
  if (!movie) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (movie.category !== "watched")
    return NextResponse.json({ error: "Notes can only be added to watched movies" }, { status: 400 });

  return NextResponse.json(await repo.update(userId, id, { notes: data }));
}