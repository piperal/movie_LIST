import { NextResponse } from "next/server";
import { validateMovie, validateStatus } from "@/lib/validate";
import * as repo from "@/lib/moviesRepo";

export async function GET(request) {
  const status = new URL(request.url).searchParams.get("status");
  if (status) {
    const { error } = validateStatus(status);
    if (error) return NextResponse.json({ error }, { status: 400 });
  }
  return NextResponse.json(await repo.list(status));
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const { data, error } = validateMovie(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  return NextResponse.json(await repo.create(data), { status: 201 });
}