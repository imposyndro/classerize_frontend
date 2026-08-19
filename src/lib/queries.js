// Shared DB query helpers used by the route handlers. Centralizes the filter
// parsing so every endpoint applies date / provider / model filters identically.

import { prisma } from "./prisma";

// Build a Prisma `where` from URLSearchParams: from, to, provider, model, label.
export function buildWhere(searchParams) {
  const where = {};

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from || to) {
    where.occurredAt = {};
    if (from) where.occurredAt.gte = new Date(from);
    if (to) where.occurredAt.lte = new Date(to);
  }

  const provider = searchParams.get("provider");
  const model = searchParams.get("model");
  if (provider || model) {
    where.model = {};
    if (provider) where.model.provider = provider;
    if (model) where.model.name = model;
  }

  const label = searchParams.get("label");
  if (label) where.label = label;

  return where;
}

// Fetch usage records (with their model joined) matching the filters.
export async function getRecords(searchParams) {
  return prisma.usageRecord.findMany({
    where: buildWhere(searchParams),
    include: { model: true },
    orderBy: { occurredAt: "desc" },
  });
}

export function getModels() {
  return prisma.model.findMany({ orderBy: [{ provider: "asc" }, { outputPricePerMTok: "desc" }] });
}
