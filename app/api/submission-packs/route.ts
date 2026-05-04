import { NextRequest, NextResponse } from "next/server";

import {
  createSubmissionPack,
  createSubmissionPackToken,
} from "@/lib/submission-pack-store";
import { buildSubmissionManifest } from "@/lib/submission-manifest";
import { getCurrentActor } from "@/lib/server-auth";
import type { StickerCount, SubmissionPackDraft } from "@/lib/types";
import { consumeUsage } from "@/lib/usage-ledger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const stickerCounts = new Set<StickerCount>([8, 16, 24, 32, 40]);

export async function POST(request: NextRequest) {
  const actor = await getCurrentActor();

  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<SubmissionPackDraft>;

  if (!body.project?.id || !body.project.name || !stickerCounts.has(body.project.stickerCount)) {
    return NextResponse.json(
      { error: "project.id, project.name, and supported stickerCount are required" },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.checks)) {
    return NextResponse.json({ error: "checks are required" }, { status: 400 });
  }

  const baseUrl = getBaseUrl(request);
  const token = createSubmissionPackToken();
  const manifestUrl = `${baseUrl}/api/submission-packs/${token}`;
  const zipUrl = `${baseUrl}/api/submission-packs/${token}/zip`;
  const manifest = buildSubmissionManifest(
    {
      project: body.project,
      checks: body.checks,
      title: body.title ?? { ja: body.project.name },
      description: body.description ?? {
        ja: "白うさぎマジシャンの日常会話向けLINEスタンプです。",
      },
      creatorName: body.creatorName ?? body.project.studioName,
      copyright:
        body.copyright ?? `© ${new Date().getFullYear()} ${body.project.studioName}`,
      containsAiGeneratedContent: body.containsAiGeneratedContent ?? true,
    },
    { baseUrl, zipUrl }
  );

  try {
    await consumeUsage(actor.id, "export", 1);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Usage limit exceeded" },
      { status: 402 }
    );
  }

  const pack = await createSubmissionPack(manifest, { token, ttlMinutes: 30 });

  return NextResponse.json(
    {
      token,
      manifestUrl,
      zipUrl,
      expiresAt: pack.expiresAt,
      manifest,
    },
    { status: 201 }
  );
}

function getBaseUrl(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}
