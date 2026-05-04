import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import {
  LocalJsonGenerationJobStore,
  type CreateGenerationJobInput,
} from "@/packages/core/src";

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
  const body = (await request.json()) as Partial<CreateGenerationJobInput>;

  if (!body.projectId || !body.type || !body.input) {
    return NextResponse.json(
      { error: "projectId, type, and input are required" },
      { status: 400 }
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
