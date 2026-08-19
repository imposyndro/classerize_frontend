import { NextResponse } from "next/server";
import { getRecords, getModels } from "@/lib/queries";
import { generateInsights } from "@/lib/insights";

export const dynamic = "force-dynamic";

// GET /api/insights?from&to&provider&model — optimization suggestions.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const [records, models] = await Promise.all([getRecords(searchParams), getModels()]);
  return NextResponse.json({ insights: generateInsights(records, models) });
}
