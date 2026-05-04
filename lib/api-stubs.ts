import { mockCharacterSheet, mockCheckResults, mockStickerPhrases } from "@/lib/mock-data";
import { createStickerPreviewItems } from "@/lib/sticker-grid";
import type {
  CheckItem,
  ExportZipInput,
  ExportZipResult,
  GenerateCharacterSheetInput,
  GenerateCharacterSheetResult,
  GenerateStickerSheetInput,
  GenerateStickerSheetResult,
  OverlayStickerTextInput,
  RegenerateStickerCellInput,
  RunChecksInput,
  SliceStickerSheetInput,
  SliceStickerSheetResult,
  StickerPreviewItem,
} from "@/lib/types";

export async function generateCharacterSheet(
  input: GenerateCharacterSheetInput
): Promise<GenerateCharacterSheetResult> {
  return {
    projectId: input.projectId,
    sheetId: `character-sheet-${input.projectId}`,
    items: mockCharacterSheet,
    provider: "mock",
    generatedAt: new Date().toISOString(),
  };
}

export async function generateStickerSheet(
  input: GenerateStickerSheetInput
): Promise<GenerateStickerSheetResult> {
  return {
    sheetId: `sticker-sheet-${input.projectId}-${input.stickerCount}`,
    stickerCount: input.stickerCount,
    previewItems: createStickerPreviewItems(input.phrases, input.stickerCount),
    provider: "mock",
    generatedAt: new Date().toISOString(),
  };
}

export async function regenerateStickerCell(
  input: RegenerateStickerCellInput
): Promise<StickerPreviewItem> {
  const phrase = mockStickerPhrases[input.targetCell - 1] ?? mockStickerPhrases[0];

  return {
    id: input.targetCell,
    phrase: {
      ...phrase,
      pose: `${phrase.pose} / 修正: ${input.fixInstruction}`,
    },
    effect: phrase.prop ?? "✨",
    checkStatus: "pass",
  };
}

export async function overlayStickerText(
  input: OverlayStickerTextInput
): Promise<{ stickerId: number; text: string; rendered: boolean }> {
  return {
    stickerId: input.stickerId,
    text: input.text,
    rendered: true,
  };
}

export async function sliceStickerSheet(
  input: SliceStickerSheetInput
): Promise<SliceStickerSheetResult> {
  const imageNames = Array.from({ length: input.stickerCount }, (_, index) =>
    `${String(index + 1).padStart(2, "0")}.png`
  );

  return {
    projectId: input.projectId,
    stickerCount: input.stickerCount,
    imageNames,
    mainImageName: "main.png",
    tabImageName: "tab.png",
  };
}

export async function runCreatorsMarketChecks(
  input: RunChecksInput
): Promise<CheckItem[]> {
  void input;
  return mockCheckResults;
}

export async function exportZip(input: ExportZipInput): Promise<ExportZipResult> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const manifest = {
    service: "StampForge AI",
    projectId: input.project.id,
    projectName: input.project.name,
    stickerCount: input.project.stickerCount,
    textMode: input.project.textMode,
    disclaimer: "This is a mock ZIP for MVP preview. This service is not an official LINE service.",
    phrases: input.phrases.slice(0, input.project.stickerCount),
    checks: input.checks,
  };

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  zip.file("README.txt", "StampForge AI MVP dummy export. Replace mock PNGs with generated assets before submission.");

  Array.from({ length: input.project.stickerCount }, (_, index) => index + 1).forEach(
    (index) => {
      zip.file(
        `stickers/${String(index).padStart(2, "0")}.txt`,
        `Dummy sticker placeholder for cell ${index}.`
      );
    }
  );

  const blob = await zip.generateAsync({ type: "blob" });

  return {
    fileName: `${input.project.id}-creators-market-mock.zip`,
    blob,
    sizeMb: Number((blob.size / 1024 / 1024).toFixed(2)),
  };
}
