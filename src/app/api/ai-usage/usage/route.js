import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRecords } from "@/lib/queries";
import { computeCostUsd } from "@/lib/pricing";

export const dynamic = "force-dynamic";

// GET /api/usage?from&to&provider&model&label&limit — list records.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const records = await getRecords(searchParams);
  const limit = Number(searchParams.get("limit")) || 0;
  return NextResponse.json({ records: limit ? records.slice(0, limit) : records });
}

// POST /api/usage — create a single usage record (manual entry).
// Body: { modelName, occurredAt?, inputTokens, cachedInputTokens, outputTokens,
//         requestCount?, label?, notes? }
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { modelName } = body || {};
  if (!modelName) {
    return NextResponse.json({ error: "modelName is required." }, { status: 400 });
  }

  const model = await prisma.model.findUnique({ where: { name: modelName } });
  if (!model) {
    return NextResponse.json({ error: `Unknown model "${modelName}".` }, { status: 400 });
  }

  const usage = {
    inputTokens: Number(body.inputTokens) || 0,
    cachedInputTokens: Number(body.cachedInputTokens) || 0,
    outputTokens: Number(body.outputTokens) || 0,
  };

  const record = await prisma.usageRecord.create({
    data: {
      modelId: model.id,
      occurredAt: body.occurredAt ? new Date(body.occurredAt) : new Date(),
      inputTokens: usage.inputTokens,
      cachedInputTokens: usage.cachedInputTokens,
      outputTokens: usage.outputTokens,
      requestCount: Number(body.requestCount) || 1,
      costUsd: computeCostUsd(model, usage),
      label: body.label?.trim() || null,
      notes: body.notes?.trim() || null,
      source: "manual",
    },
    include: { model: true },
  });

  return NextResponse.json({ record }, { status: 201 });
}
