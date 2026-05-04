import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import {
  LocalJsonGenerationJobStore,
  type CreateGenerationJobInput,
} from "@/packages/core/src";
import { getCurrentActor } from "@/lib/server-auth";
import { consumeUsage } from "@/lib/usage-ledger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const store = new LocalJsonGenerationJobStore();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get("projectId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const jobs = await store.list({
    projectId,
    status: isKnownStatus(status) ? status : undefined,
  });

  return NextResponse.json({ jobs });
}

export async function POST(request: NextRequest) {
  const actor = await getCurrentActor();

  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<CreateGenerationJobInput>;

  if (!body.projectId || !body.type || !body.input) {
    return NextResponse.json(
      { error: "projectId, type, and input are required" },
      { status: 400 }
    );
  }

  try {
    await consumeUsage(actor.id, "generation", getGenerationCreditCost(body));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Usage limit exceeded" },
      { status: 402 }
    );
  }

  const now = new Date().toISOString();
  const job = await store.create({
    id: randomUUID(),
    projectId: body.projectId,
    type: body.type,
    status: "queued",
    provider: body.provider ?? "codex-app-server",
    input: body.input,
    outputAssetIds: [],
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ job }, { status: 201 });
}

function getGenerationCreditCost(input: Partial<CreateGenerationJobInput>) {
  if (input.type === "regenerate-sticker-cell") {
    return 1;
  }

  if (input.type === "generate-character-sheet") {
    return 3;
  }

  if (
    input.type === "generate-sticker-sheet" &&
    input.input &&
    "stickerCount" in input.input &&
    typeof input.input.stickerCount === "number"
  ) {
    return Math.max(2, Math.ceil(input.input.stickerCount / 8) * 2);
  }

  return 2;
}

function isKnownStatus(
  status: string | undefined
): status is "queued" | "running" | "succeeded" | "failed" | "canceled" {
  return (
    status === "queued" ||
    status === "running" ||
    status === "succeeded" ||
    status === "failed" ||
    status === "canceled"
  );
}
