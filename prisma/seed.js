// Seeds the pricing catalog and ~80 days of sample usage so every chart and KPI
// renders on first run. Run with `npm run seed` (or automatically on migrate).
//
// Run via `node prisma/seed.js` (CommonJS). The cost formula here mirrors
// src/lib/pricing.js — keep the two in sync if the formula ever changes.

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const TOKENS_PER_MILLION = 1_000_000;

function computeCostUsd(model, { inputTokens = 0, cachedInputTokens = 0, outputTokens = 0 }) {
  const cost =
    (inputTokens * model.inputPricePerMTok +
      cachedInputTokens * model.cachedInputPricePerMTok +
      outputTokens * model.outputPricePerMTok) /
    TOKENS_PER_MILLION;
  return Math.round(cost * 1e6) / 1e6;
}

// Pricing in USD per 1,000,000 tokens.
// Claude prices are current as of this build; Gemini prices are approximate —
// VERIFY against https://ai.google.dev/gemini-api/docs/pricing before relying on them.
const MODELS = [
  // --- Anthropic / Claude ---
  { name: "claude-opus-4-8", displayName: "Claude Opus 4.8", provider: "Anthropic", inputPricePerMTok: 5, cachedInputPricePerMTok: 0.5, outputPricePerMTok: 25, contextWindow: 1_000_000 },
  { name: "claude-sonnet-4-6", displayName: "Claude Sonnet 4.6", provider: "Anthropic", inputPricePerMTok: 3, cachedInputPricePerMTok: 0.3, outputPricePerMTok: 15, contextWindow: 1_000_000 },
  { name: "claude-haiku-4-5", displayName: "Claude Haiku 4.5", provider: "Anthropic", inputPricePerMTok: 1, cachedInputPricePerMTok: 0.1, outputPricePerMTok: 5, contextWindow: 200_000 },
  { name: "claude-fable-5", displayName: "Claude Fable 5", provider: "Anthropic", inputPricePerMTok: 10, cachedInputPricePerMTok: 1, outputPricePerMTok: 50, contextWindow: 1_000_000 },
  // --- Google / Gemini (verify prices) ---
  { name: "gemini-2.5-pro", displayName: "Gemini 2.5 Pro", provider: "Google", inputPricePerMTok: 1.25, cachedInputPricePerMTok: 0.31, outputPricePerMTok: 10, contextWindow: 1_000_000 },
  { name: "gemini-2.5-flash", displayName: "Gemini 2.5 Flash", provider: "Google", inputPricePerMTok: 0.3, cachedInputPricePerMTok: 0.075, outputPricePerMTok: 2.5, contextWindow: 1_000_000 },
  { name: "gemini-2.5-flash-lite", displayName: "Gemini 2.5 Flash-Lite", provider: "Google", inputPricePerMTok: 0.1, cachedInputPricePerMTok: 0.025, outputPricePerMTok: 0.4, contextWindow: 1_000_000 },
];

const LABELS = ["coding-agent", "research", "summarization", "chatbot", "data-extraction"];

// Relative daily usage weight per model so the sample looks realistic
// (heavy on mid-tier models, lighter on the premium ones).
const WEIGHTS = {
  "claude-sonnet-4-6": 1.0,
  "claude-opus-4-8": 0.45,
  "claude-haiku-4-5": 0.7,
  "claude-fable-5": 0.15,
  "gemini-2.5-flash": 0.8,
  "gemini-2.5-pro": 0.4,
  "gemini-2.5-flash-lite": 0.5,
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("Seeding pricing catalog…");
  const modelRecords = {};
  for (const m of MODELS) {
    const rec = await prisma.model.upsert({
      where: { name: m.name },
      update: m,
      create: m,
    });
    modelRecords[m.name] = rec;
  }

  console.log("Clearing existing usage records…");
  await prisma.usageRecord.deleteMany({});

  console.log("Generating ~80 days of sample usage…");
  const DAYS = 80;
  const now = new Date();
  const rows = [];

  for (let d = DAYS; d >= 0; d--) {
    const day = new Date(now);
    day.setDate(now.getDate() - d);
    // Gentle upward trend + weekday seasonality for a realistic-looking chart.
    const trend = 0.6 + (DAYS - d) / DAYS; // 0.6 -> 1.6
    const weekday = day.getDay();
    const seasonal = weekday === 0 || weekday === 6 ? 0.5 : 1; // quieter weekends

    for (const m of MODELS) {
      const weight = (WEIGHTS[m.name] || 0.3) * trend * seasonal;
      const recordsToday = Math.round(weight * randInt(1, 3));
      for (let r = 0; r < recordsToday; r++) {
        const occurredAt = new Date(day);
        occurredAt.setHours(randInt(7, 22), randInt(0, 59), 0, 0);

        // Token scale loosely tied to how "premium" the model is.
        const scale = m.outputPricePerMTok >= 15 ? 1 : 2.2;
        const inputTokens = randInt(2_000, 60_000) * scale;
        const cachedInputTokens =
          Math.random() < 0.5 ? Math.round(inputTokens * (Math.random() * 0.6)) : 0;
        const outputTokens = randInt(500, 12_000) * scale;
        const requestCount = randInt(1, 8);

        const model = modelRecords[m.name];
        const costUsd = computeCostUsd(model, { inputTokens, cachedInputTokens, outputTokens });

        rows.push({
          occurredAt,
          modelId: model.id,
          inputTokens,
          cachedInputTokens,
          outputTokens,
          requestCount,
          costUsd,
          label: LABELS[randInt(0, LABELS.length - 1)],
          source: "import",
        });
      }
    }
  }

  // createMany is fast and supported on SQLite in Prisma 6.
  await prisma.usageRecord.createMany({ data: rows });

  const total = rows.reduce((s, r) => s + r.costUsd, 0);
  console.log(`Inserted ${rows.length} usage records (~$${total.toFixed(2)} total spend).`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
