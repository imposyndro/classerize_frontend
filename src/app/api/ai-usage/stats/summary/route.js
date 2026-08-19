import { NextResponse } from "next/server";
import { getRecords } from "@/lib/queries";
import { summarize, timeSeries, byModel, byProvider, byLabel } from "@/lib/aggregate";

export const dynamic = "force-dynamic";

// GET /api/stats/summary?from&to&provider&model&granularity
// Returns headline totals plus the aggregations every chart needs.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const granularity = searchParams.get("granularity") || "day";
  const records = await getRecords(searchParams);

  return NextResponse.json({
    totals: summarize(records),
    series: timeSeries(records, granularity),
    byModel: byModel(records),
    byProvider: byProvider(records),
    byLabel: byLabel(records),
    count: records.length,
  });
}
