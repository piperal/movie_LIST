import { NextResponse } from "next/server";
import * as repo from "@/lib/moviesRepo";

export async function GET() {
  return NextResponse.json(await repo.stats());
}