import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { SubmissionManifest } from "@/lib/types";

type SubmissionPackRecord = {
  token: string;
  manifest: SubmissionManifest;
  createdAt: string;
  expiresAt: string;
};

type SubmissionPackDatabase = {
  packs: SubmissionPackRecord[];
};

const storePath = path.join(process.cwd(), ".data", "submission-packs.json");

export function createSubmissionPackToken() {
  return randomBytes(24).toString("base64url");
}

export async function createSubmissionPack(
  manifest: SubmissionManifest,
  options?: { ttlMinutes?: number; token?: string }
) {
  const ttlMinutes = options?.ttlMinutes ?? 30;
  const now = new Date();
  const token = options?.token ?? createSubmissionPackToken();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000).toISOString();
  const db = await readDatabase();
  const activePacks = db.packs.filter((pack) => !isExpired(pack.expiresAt));

  activePacks.push({
    token,
    manifest,
    createdAt: now.toISOString(),
    expiresAt,
  });

  await writeDatabase({ packs: activePacks });

  return {
    token,
    expiresAt,
  };
}

export async function getSubmissionPack(token: string) {
  const db = await readDatabase();
  const pack = db.packs.find((item) => item.token === token);

  if (!pack || isExpired(pack.expiresAt)) {
    if (pack) {
      await pruneExpiredSubmissionPacks();
    }

    return null;
  }

  return pack;
}

export async function pruneExpiredSubmissionPacks() {
  const db = await readDatabase();
  const packs = db.packs.filter((pack) => !isExpired(pack.expiresAt));

  if (packs.length !== db.packs.length) {
    await writeDatabase({ packs });
  }

  return packs.length;
}

function isExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now();
}

async function readDatabase(): Promise<SubmissionPackDatabase> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as SubmissionPackDatabase;
    return {
      packs: Array.isArray(parsed.packs) ? parsed.packs : [],
    };
  } catch {
    return { packs: [] };
  }
}

async function writeDatabase(db: SubmissionPackDatabase) {
  await mkdir(path.dirname(storePath), { recursive: true });
  const tempPath = `${storePath}.${process.pid}.tmp`;
  await writeFile(tempPath, JSON.stringify(db, null, 2));
  await rename(tempPath, storePath);
}
