import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import sharp from "sharp";

import { getProjectGeneratedDir } from "./paths";
import type { StickerCount } from "./types";

const stickerGrids: Record<StickerCount, { columns: number; rows: number }> = {
  8: { columns: 4, rows: 2 },
  16: { columns: 4, rows: 4 },
  24: { columns: 6, rows: 4 },
  32: { columns: 8, rows: 4 },
  40: { columns: 8, rows: 5 },
};

export async function deriveCharacterSheetViewAssets(input: {
  cwd: string;
  projectId: string;
  sheetPath: string;
}) {
  const absoluteSheetPath = resolve(input.cwd, input.sheetPath);
  const metadata = await sharp(absoluteSheetPath).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Cannot read character sheet size: ${input.sheetPath}`);
  }

  const views = [
    { name: "front", left: 0.02, top: 0.02, width: 0.21, height: 0.36, outputWidth: 240, outputHeight: 240 },
    { name: "diagonal", left: 0.23, top: 0.03, width: 0.21, height: 0.36, outputWidth: 240, outputHeight: 240 },
    { name: "side", left: 0.45, top: 0.03, width: 0.2, height: 0.36, outputWidth: 240, outputHeight: 240 },
    { name: "back", left: 0.64, top: 0.04, width: 0.22, height: 0.36, outputWidth: 240, outputHeight: 240 },
    { name: "expressions", left: 0.05, top: 0.44, width: 0.5, height: 0.24, outputWidth: 360, outputHeight: 180 },
  ] as const;

  for (const view of views) {
    const left = Math.max(0, Math.round(metadata.width * view.left));
    const top = Math.max(0, Math.round(metadata.height * view.top));
    const outputPath = resolve(
      input.cwd,
      getProjectGeneratedDir(input.projectId),
      "character-views",
      `${view.name}.png`
    );
    await mkdir(dirname(outputPath), { recursive: true });

    await sharp(absoluteSheetPath)
      .extract({
        left,
        top,
        width: Math.min(
          metadata.width - left,
          Math.round(metadata.width * view.width)
        ),
        height: Math.min(
          metadata.height - top,
          Math.round(metadata.height * view.height)
        ),
      })
      .resize(view.outputWidth, view.outputHeight, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(outputPath);
  }
}

export async function sliceStickerSheetAsset(input: {
  cwd: string;
  projectId: string;
  stickerCount: StickerCount;
  sheetPath: string;
}) {
  const absoluteSheetPath = resolve(input.cwd, input.sheetPath);
  const metadata = await sharp(absoluteSheetPath).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Cannot read sticker sheet size: ${input.sheetPath}`);
  }

  const grid = stickerGrids[input.stickerCount];
  const cellWidth = Math.floor(metadata.width / grid.columns);
  const cellHeight = Math.floor(metadata.height / grid.rows);
  const generatedDir = resolve(input.cwd, getProjectGeneratedDir(input.projectId));
  const stampDir = resolve(generatedDir, "stamps");

  await mkdir(stampDir, { recursive: true });

  for (const index of Array.from({ length: input.stickerCount }, (_, itemIndex) => itemIndex)) {
    const row = Math.floor(index / grid.columns);
    const column = index % grid.columns;
    const outputPath = resolve(stampDir, `${String(index + 1).padStart(2, "0")}.png`);

    await sharp(absoluteSheetPath)
      .extract({
        left: column * cellWidth,
        top: row * cellHeight,
        width: cellWidth,
        height: cellHeight,
      })
      .resize(370, 320, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .png()
      .toFile(outputPath);
    await makeBorderBackgroundTransparent(outputPath, outputPath);
  }

  const firstStickerPath = resolve(stampDir, "01.png");
  await sharp(firstStickerPath)
    .resize(240, 240, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(resolve(generatedDir, "main.png"));
  await makeBorderBackgroundTransparent(
    resolve(generatedDir, "main.png"),
    resolve(generatedDir, "main.png")
  );

  await sharp(firstStickerPath)
    .resize(96, 74, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(resolve(generatedDir, "tab.png"));
  await makeBorderBackgroundTransparent(
    resolve(generatedDir, "tab.png"),
    resolve(generatedDir, "tab.png")
  );
}

export async function makeBorderBackgroundTransparent(
  inputPath: string,
  outputPath: string
) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels;
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return;
    }

    const pixelIndex = y * width + x;
    if (visited[pixelIndex]) {
      return;
    }

    const dataIndex = pixelIndex * channels;
    if (!isRemovableBackground(data, dataIndex)) {
      return;
    }

    visited[pixelIndex] = 1;
    queue.push(pixelIndex);
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }

  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (queue.length > 0) {
    const pixelIndex = queue.pop();
    if (pixelIndex === undefined) {
      continue;
    }

    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    const dataIndex = pixelIndex * channels;
    data[dataIndex + 3] = 0;

    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  await sharp(data, {
    raw: {
      width,
      height,
      channels,
    },
  })
    .png()
    .toFile(outputPath);
}

function isRemovableBackground(data: Buffer, index: number) {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  const alpha = data[index + 3];

  return alpha > 0 && red >= 246 && green >= 246 && blue >= 246;
}
