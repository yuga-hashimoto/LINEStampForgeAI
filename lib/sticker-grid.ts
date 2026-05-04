import type { StickerCount, StickerPhrase, StickerPreviewItem } from "@/lib/types";

export const stickerGridMap: Record<StickerCount, { columns: number; rows: number }> = {
  8: { columns: 4, rows: 2 },
  16: { columns: 4, rows: 4 },
  24: { columns: 6, rows: 4 },
  32: { columns: 8, rows: 4 },
  40: { columns: 8, rows: 5 },
};

export function getStickerGrid(stickerCount: StickerCount) {
  return stickerGridMap[stickerCount];
}

export function createStickerPreviewItems(
  phrases: StickerPhrase[],
  stickerCount: StickerCount
): StickerPreviewItem[] {
  const effects = ["✨", "⭐", "🪄", "🌙", "☕", "🚪", "🔥", "💧", "💛", "🎉"];

  return phrases.slice(0, stickerCount).map((phrase, index) => ({
    id: phrase.id,
    phrase,
    effect: phrase.prop ?? effects[index % effects.length],
    checkStatus: "pass",
  }));
}
