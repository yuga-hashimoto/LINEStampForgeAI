import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";

const maxReferenceImageBytes = 5 * 1024 * 1024;

const allowedImageTypes = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
]);

function sanitizeFileName(name: string) {
  const baseName = path.basename(name).replace(/\.[^.]+$/, "");
  const safeName = baseName
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return safeName || "reference";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "画像ファイルを選択してください。" }, { status: 400 });
  }

  const extension = allowedImageTypes.get(file.type);

  if (!extension) {
    return NextResponse.json(
      { error: "PNG、JPEG、WebPのいずれかをアップロードしてください。" },
      { status: 400 }
    );
  }

  if (file.size > maxReferenceImageBytes) {
    return NextResponse.json(
      { error: "参照画像は5MB以内にしてください。" },
      { status: 400 }
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "reference-images");
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}-${sanitizeFileName(file.name)}.${extension}`;
  const filePath = path.join(uploadDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, bytes);

  return NextResponse.json({
    name: file.name,
    url: `/uploads/reference-images/${fileName}`,
    mimeType: file.type,
    sizeBytes: file.size,
  });
}
