import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { validateMovie, validateCategory } from "@/lib/validate";
import * as repo from "@/lib/moviesRepo";

export async function GET(request) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const category = new URL(request.url).searchParams.get("category");
  if (category) {
    const { error } = validateCategory(category);
    if (error) return NextResponse.json({ error }, { status: 400 });
  }
  return NextResponse.json(await repo.list(userId, category));
}

export async function POST(request) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { data, error } = validateMovie(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  return NextResponse.json(await repo.create(userId, data), { status: 201 });
}