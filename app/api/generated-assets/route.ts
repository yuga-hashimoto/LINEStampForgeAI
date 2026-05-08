import { mkdir } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import sharp from "sharp";

import {
  deriveCharacterSheetViewAssets,
  getCharacterSheetAssetPath,
  getStickerSheetAssetPath,
  sliceStickerSheetAsset,
  type StickerCount,
} from "@/packages/core/src";

export const runtime = "nodejs";

const maxUploadBytes = 30 * 1024 * 1024;
const allowedImageTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const stickerGridByCount: Record<StickerCount, { columns: number; rows: number }> = {
  8: { columns: 4, rows: 2 },
  16: { columns: 4, rows: 4 },
  24: { columns: 6, rows: 4 },
  32: { columns: 8, rows: 4 },
  40: { columns: 8, rows: 5 },
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const assetType = String(formData.get("assetType") ?? "").trim();
  const stickerCount = Number(formData.get("stickerCount"));
  const file = formData.get("file");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "画像ファイルを選択してください。" }, { status: 400 });
  }

  if (!allowedImageTypes.has(file.type)) {
    return NextResponse.json(
      { error: "PNG、JPEG、WebPのいずれかをアップロードしてください。" },
      { status: 400 }
    );
  }

  if (file.size > maxUploadBytes) {
    return NextResponse.json({ error: "画像は30MB以内にしてください。" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  if (assetType === "character-sheet") {
    const outputPath = getCharacterSheetAssetPath(projectId);
    const absoluteOutputPath = path.join(process.cwd(), outputPath);
    await mkdir(path.dirname(absoluteOutputPath), { recursive: true });

    await sharp(bytes)
      .resize({
        width: 1800,
        height: 1800,
        fit: "inside",
        withoutEnlargement: true,
      })
      .png()
      .toFile(absoluteOutputPath);

    await deriveCharacterSheetViewAssets({
      cwd: process.cwd(),
      projectId,
      sheetPath: outputPath,
    });

    return NextResponse.json({
      publicUrl: outputPath.replace(/^public/, ""),
      updatedAt: new Date().toISOString(),
    });
  }

  if (assetType === "sticker-sheet" && isStickerCount(stickerCount)) {
    const outputPath = getStickerSheetAssetPath(projectId, stickerCount);
    const absoluteOutputPath = path.join(process.cwd(), outputPath);
    const grid = stickerGridByCount[stickerCount];
    await mkdir(path.dirname(absoluteOutputPath), { recursive: true });

    await sharp(bytes)
      .resize(grid.columns * 370, grid.rows * 320, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(absoluteOutputPath);

    await sliceStickerSheetAsset({
      cwd: process.cwd(),
      projectId,
      stickerCount,
      sheetPath: outputPath,
    });

    return NextResponse.json({
      publicUrl: outputPath.replace(/^public/, ""),
      updatedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json(
    { error: "assetType must be character-sheet or sticker-sheet." },
    { status: 400 }
  );
}

function isStickerCount(value: number): value is StickerCount {
  return value === 8 || value === 16 || value === 24 || value === 32 || value === 40;
}
