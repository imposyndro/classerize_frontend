import { NextResponse } from "next/server";
import Papa from "papaparse";
import { prisma } from "@/lib/prisma";
import { computeCostUsd } from "@/lib/pricing";

export const dynamic = "force-dynamic";

// POST /api/usage/import
// Body (one of):
//   { csv: "<csv text>" }                  CSV with a header row
//   { records: [ {...}, ... ] }            array of record objects
//
// Each row/record needs at least: model, inputTokens, outputTokens.
// Optional: occurredAt, cachedInputTokens, requestCount, label, notes.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let rows = [];
  if (typeof body.csv === "string" && body.csv.trim()) {
    const parsed = Papa.parse(body.csv.trim(), {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });
    if (parsed.errors?.length) {
      return NextResponse.json(
        { error: "CSV parse error", details: parsed.errors.slice(0, 5) },
        { status: 400 }
      );
    }
    rows = parsed.data;
  } else if (Array.isArray(body.records)) {
    rows = body.records;
  } else {
    return NextResponse.json(
      { error: "Provide either `csv` (string) or `records` (array)." },
      { status: 400 }
    );
  }

  if (!rows.length) {
    return NextResponse.json({ error: "No rows to import." }, { status: 400 });
  }

  // Resolve models once.
  const models = await prisma.model.findMany();
  const byName = new Map(models.map((m) => [m.name.toLowerCase(), m]));

  const toInsert = [];
  const skipped = [];

  rows.forEach((row, i) => {
    const modelName = String(row.model || row.modelName || "").trim().toLowerCase();
    const model = byName.get(modelName);
    if (!model) {
      skipped.push({ row: i + 1, reason: `Unknown model "${row.model || row.modelName || ""}"` });
      return;
    }

    const usage = {
      inputTokens: toInt(row.inputTokens),
      cachedInputTokens: toInt(row.cachedInputTokens),
      outputTokens: toInt(row.outputTokens),
    };

    if (!usage.inputTokens && !usage.outputTokens && !usage.cachedInputTokens) {
      skipped.push({ row: i + 1, reason: "No token counts" });
      return;
    }

    const occurredAt = row.occurredAt ? new Date(row.occurredAt) : new Date();
    if (Number.isNaN(occurredAt.getTime())) {
      skipped.push({ row: i + 1, reason: `Invalid date "${row.occurredAt}"` });
      return;
    }

    toInsert.push({
      modelId: model.id,
      occurredAt,
      inputTokens: usage.inputTokens,
      cachedInputTokens: usage.cachedInputTokens,
      outputTokens: usage.outputTokens,
      requestCount: toInt(row.requestCount) || 1,
      costUsd: computeCostUsd(model, usage),
      label: row.label ? String(row.label).trim() : null,
      notes: row.notes ? String(row.notes).trim() : null,
      source: "import",
    });
  });

  if (toInsert.length) {
    await prisma.usageRecord.createMany({ data: toInsert });
  }

  return NextResponse.json({
    imported: toInsert.length,
    skipped: skipped.length,
    skippedDetails: skipped.slice(0, 20),
  });
}

function toInt(v) {
  const n = parseInt(String(v ?? "").replace(/[, ]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}
