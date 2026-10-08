import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import * as repo from "@/lib/moviesRepo";

export async function GET(request) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await repo.stats(userId));
}