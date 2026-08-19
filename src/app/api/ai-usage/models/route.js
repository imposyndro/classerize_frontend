import { NextResponse } from "next/server";
import { getModels } from "@/lib/queries";

export const dynamic = "force-dynamic";

// GET /api/models — the pricing catalog.
export async function GET() {
  const models = await getModels();
  return NextResponse.json({ models });
}
