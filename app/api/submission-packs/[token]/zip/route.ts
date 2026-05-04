import { NextResponse } from "next/server";

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
      "StampForge AI submission pack mock export.",
      "This service is not an official LINE service.",
      "Review approval is not guaranteed.",
      "Replace placeholder files with generated PNG assets before real submission.",
    ].join("\n")
  );

  Array.from({ length: count }, (_, index) => index + 1).forEach((index) => {
    zip.file(
      `stickers/${String(index).padStart(2, "0")}.png.txt`,
      `Placeholder for static sticker ${index}. Use an actual transparent PNG for production submission.`
    );
  });

  zip.file("main.png.txt", "Placeholder for 240 x 240 main image.");
  zip.file("tab.png.txt", "Placeholder for 96 x 74 tab image.");

  const buffer = await zip.generateAsync({ type: "arraybuffer" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${pack.manifest.projectId}-submission-pack.zip"`,
    },
  });
}
