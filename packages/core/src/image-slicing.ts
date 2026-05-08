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
  const generatedDir = resolve(input.cwd, getProjectGeneratedDir(input.projectId));
  const stampDir = resolve(generatedDir, "stamps");

  await mkdir(stampDir, { recursive: true });

  for (const index of Array.from({ length: input.stickerCount }, (_, itemIndex) => itemIndex)) {
    const outputPath = resolve(stampDir, `${String(index + 1).padStart(2, "0")}.png`);
    const bounds = getSafeCellBounds({
      index,
      columns: grid.columns,
      rows: grid.rows,
      sheetWidth: metadata.width,
      sheetHeight: metadata.height,
    });

    const extracted = await sharp(absoluteSheetPath).extract(bounds).png().toBuffer();
    const transparent = await removeBorderBackground(extracted);
    await renderContainedPng({
      input: await trimTransparentImage(transparent),
      outputPath,
      width: 370,
      height: 320,
      maxContentWidth: 350,
      maxContentHeight: 300,
    });
  }

  const firstStickerPath = resolve(stampDir, "01.png");
  await renderContainedPng({
    input: firstStickerPath,
    outputPath: resolve(generatedDir, "main.png"),
    width: 240,
    height: 240,
    maxContentWidth: 220,
    maxContentHeight: 220,
  });
  await renderContainedPng({
    input: firstStickerPath,
    outputPath: resolve(generatedDir, "tab.png"),
    width: 96,
    height: 74,
    maxContentWidth: 86,
    maxContentHeight: 64,
  });
}

export async function makeBorderBackgroundTransparent(
  inputPath: string,
  outputPath: string
) {
  const transparent = await removeBorderBackground(inputPath);
  await sharp(transparent).png().toFile(outputPath);
}

async function removeBorderBackground(input: string | Buffer) {
  const { data, info } = await sharp(input)
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

  return sharp(data, {
    raw: {
      width,
      height,
      channels,
    },
  })
    .png()
    .toBuffer();
}

function getSafeCellBounds(input: {
  index: number;
  columns: number;
  rows: number;
  sheetWidth: number;
  sheetHeight: number;
}) {
  const row = Math.floor(input.index / input.columns);
  const column = input.index % input.columns;
  const leftEdge = Math.round((input.sheetWidth * column) / input.columns);
  const rightEdge = Math.round((input.sheetWidth * (column + 1)) / input.columns);
  const topEdge = Math.round((input.sheetHeight * row) / input.rows);
  const bottomEdge = Math.round((input.sheetHeight * (row + 1)) / input.rows);
  const rawWidth = rightEdge - leftEdge;
  const rawHeight = bottomEdge - topEdge;
  const insetX = Math.max(2, Math.round(rawWidth * 0.035));
  const insetY = Math.max(2, Math.round(rawHeight * 0.035));

  return {
    left: leftEdge + insetX,
    top: topEdge + insetY,
    width: Math.max(1, rawWidth - insetX * 2),
    height: Math.max(1, rawHeight - insetY * 2),
  };
}

async function trimTransparentImage(input: Buffer) {
  try {
    return await sharp(input).trim({ threshold: 8 }).png().toBuffer();
  } catch {
    return input;
  }
}

async function renderContainedPng(input: {
  input: string | Buffer;
  outputPath: string;
  width: number;
  height: number;
  maxContentWidth: number;
  maxContentHeight: number;
}) {
  const resized = await sharp(input.input)
    .ensureAlpha()
    .resize(input.maxContentWidth, input.maxContentHeight, {
      fit: "inside",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
  const metadata = await sharp(resized).metadata();
  const resizedWidth = metadata.width ?? input.maxContentWidth;
  const resizedHeight = metadata.height ?? input.maxContentHeight;
  const left = Math.max(0, Math.floor((input.width - resizedWidth) / 2));
  const right = Math.max(0, input.width - resizedWidth - left);
  const top = Math.max(0, Math.floor((input.height - resizedHeight) / 2));
  const bottom = Math.max(0, input.height - resizedHeight - top);

  await sharp(resized)
    .extend({
      left,
      right,
      top,
      bottom,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(input.outputPath);
}

function isRemovableBackground(data: Buffer, index: number) {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  const alpha = data[index + 3];

  return alpha > 0 && red >= 246 && green >= 246 && blue >= 246;
}
