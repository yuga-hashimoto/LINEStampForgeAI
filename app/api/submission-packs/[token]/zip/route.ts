import { NextResponse } from "next/server";
import type JSZip from "jszip";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { getSubmissionPack } from "@/lib/submission-pack-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const pack = await getSubmissionPack(token);

  if (!pack) {
    return NextResponse.json(
      { error: "submission pack was not found or has expired" },
      { status: 404 }
    );
  }

  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const count = pack.manifest.stickerCount;

  zip.file("submission-manifest.json", JSON.stringify(pack.manifest, null, 2));
  zip.file(
    "README.txt",
    [
      "StampForge AI submission pack export.",
      "This service is not an official LINE service.",
      "Review approval is not guaranteed.",
      "Check the latest Creators Market rules before submission.",
    ].join("\n")
  );

  try {
    await addGeneratedPng(zip, "main.png", pack.manifest.projectId, "main.png");
    await addGeneratedPng(zip, "tab.png", pack.manifest.projectId, "tab.png");

    for (const index of Array.from({ length: count }, (_, itemIndex) => itemIndex + 1)) {
      await addGeneratedPng(
        zip,
        `stickers/${String(index).padStart(2, "0")}.png`,
        pack.manifest.projectId,
        "stamps",
        `${String(index).padStart(2, "0")}.png`
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "generated PNG assets were not found",
      },
      { status: 409 }
    );
  }

  const buffer = await zip.generateAsync({ type: "arraybuffer" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${pack.manifest.projectId}-submission-pack.zip"`,
    },
  });
}

async function addGeneratedPng(
  zip: JSZip,
  zipPath: string,
  projectId: string,
  ...segments: string[]
) {
  const filePath = join(process.cwd(), "public", "generated", "projects", projectId, ...segments);
  zip.file(zipPath, await readFile(filePath));
}
