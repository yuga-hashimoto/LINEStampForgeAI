import type { StickerCount } from "./types";

export function getProjectGeneratedDir(projectId: string) {
  return `public/generated/projects/${projectId}`;
}

export function getProjectPromptDir(projectId: string) {
  return `.prompts/projects/${projectId}`;
}

export function getCharacterSheetAssetPath(projectId: string) {
  return `${getProjectGeneratedDir(projectId)}/character-sheet.png`;
}

export function getStickerSheetAssetPath(projectId: string, stickerCount: StickerCount) {
  return `${getProjectGeneratedDir(projectId)}/sticker-sheet-${stickerCount}.png`;
}

export function getRegeneratedCellAssetPath(projectId: string, cellId: number) {
  return `${getProjectGeneratedDir(projectId)}/regenerated-cell-${cellId}.png`;
}

export function getCharacterSheetPromptPath(projectId: string) {
  return `${getProjectPromptDir(projectId)}/character-sheet.prompt.txt`;
}

export function getStickerSheetPromptPath(projectId: string, stickerCount: StickerCount) {
  return `${getProjectPromptDir(projectId)}/sticker-sheet-${stickerCount}.prompt.txt`;
}

export function getRegeneratedCellPromptPath(projectId: string, cellId: number) {
  return `${getProjectPromptDir(projectId)}/regenerated-cell-${cellId}.prompt.txt`;
}

export function toPublicGeneratedUrl(assetPath: string) {
  return assetPath.replace(/^public/, "");
}
