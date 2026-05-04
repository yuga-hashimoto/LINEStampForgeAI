import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type UsageKind = "generation" | "export" | "extraGeneration";

export type UsageLedger = {
  actorId: string;
  planName: string;
  planType: "one-shot" | "subscription" | "development";
  generationCreditsLimit: number;
  generationCreditsUsed: number;
  exportLimit: number;
  exportUsed: number;
  extraGenerationLimit: number;
  extraGenerationUsed: number;
  updatedAt: string;
};

type UsageDatabase = {
  ledgers: UsageLedger[];
};

const storePath = path.join(process.cwd(), ".data", "usage-ledger.json");

export async function getUsageLedger(actorId: string) {
  const db = await readDatabase();
  const existing = db.ledgers.find((ledger) => ledger.actorId === actorId);

  if (existing) {
    return existing;
  }

  const created = createDefaultLedger(actorId);
  await writeLedger(created);
  return created;
}

export async function consumeUsage(
  actorId: string,
  kind: UsageKind,
  amount: number
) {
  const ledger = await getUsageLedger(actorId);
  const next = { ...ledger, updatedAt: new Date().toISOString() };

  if (kind === "generation") {
    assertWithinLimit(
      next.generationCreditsUsed,
      next.generationCreditsLimit,
      amount,
      "生成クレジット"
    );
    next.generationCreditsUsed += amount;
  }

  if (kind === "export") {
    assertWithinLimit(next.exportUsed, next.exportLimit, amount, "書き出し数");
    next.exportUsed += amount;
  }

  if (kind === "extraGeneration") {
    assertWithinLimit(
      next.extraGenerationUsed,
      next.extraGenerationLimit,
      amount,
      "追加生成"
    );
    next.extraGenerationUsed += amount;
  }

  await writeLedger(next);
  return next;
}

export async function applyPurchasedPlan(
  actorId: string,
  purchase: {
    planName: string;
    planType: UsageLedger["planType"];
    generationCreditsLimit?: number;
    generationCreditsIncrement?: number;
    exportLimit?: number;
    exportIncrement?: number;
    extraGenerationLimit?: number;
    extraGenerationIncrement?: number;
    preserveCurrentPlan?: boolean;
  }
) {
  const ledger = await getUsageLedger(actorId);
  const next: UsageLedger = {
    ...ledger,
    planName: purchase.preserveCurrentPlan ? ledger.planName : purchase.planName,
    planType: purchase.preserveCurrentPlan ? ledger.planType : purchase.planType,
    generationCreditsLimit:
      (purchase.generationCreditsLimit ?? ledger.generationCreditsLimit) +
      (purchase.generationCreditsIncrement ?? 0),
    exportLimit:
      (purchase.exportLimit ?? ledger.exportLimit) + (purchase.exportIncrement ?? 0),
    extraGenerationLimit:
      (purchase.extraGenerationLimit ?? ledger.extraGenerationLimit) +
      (purchase.extraGenerationIncrement ?? 0),
    updatedAt: new Date().toISOString(),
  };

  await writeLedger(next);
  return next;
}

function createDefaultLedger(actorId: string): UsageLedger {
  const isDevelopmentActor = actorId === "dev-demo-user";

  return {
    actorId,
    planName: isDevelopmentActor ? "開発デモ" : "24個標準",
    planType: isDevelopmentActor ? "development" : "one-shot",
    generationCreditsLimit: isDevelopmentActor ? 200 : 20,
    generationCreditsUsed: 0,
    exportLimit: isDevelopmentActor ? 50 : 1,
    exportUsed: 0,
    extraGenerationLimit: isDevelopmentActor ? 50 : 5,
    extraGenerationUsed: 0,
    updatedAt: new Date().toISOString(),
  };
}

function assertWithinLimit(
  used: number,
  limit: number,
  amount: number,
  label: string
) {
  if (amount < 1 || !Number.isFinite(amount)) {
    throw new Error(`${label}の消費量が不正です。`);
  }

  if (used + amount > limit) {
    throw new Error(`${label}の上限に達しています。プランまたは追加オプションを確認してください。`);
  }
}

async function writeLedger(ledger: UsageLedger) {
  const db = await readDatabase();
  const ledgers = [
    ...db.ledgers.filter((item) => item.actorId !== ledger.actorId),
    ledger,
  ];

  await writeDatabase({ ledgers });
}

async function readDatabase(): Promise<UsageDatabase> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as UsageDatabase;
    return {
      ledgers: Array.isArray(parsed.ledgers) ? parsed.ledgers : [],
    };
  } catch {
    return { ledgers: [] };
  }
}

async function writeDatabase(db: UsageDatabase) {
  await mkdir(path.dirname(storePath), { recursive: true });
  const tempPath = `${storePath}.${process.pid}.tmp`;
  await writeFile(tempPath, JSON.stringify(db, null, 2));
  await rename(tempPath, storePath);
}
