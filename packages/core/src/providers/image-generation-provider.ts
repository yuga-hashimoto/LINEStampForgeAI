import type {
  GenerateCharacterSheetInput,
  GeneratedAsset,
  GenerateStickerSheetInput,
  ImageGenerationProviderType,
  RegenerateStickerCellInput,
} from "../types";

export interface ImageGenerationProviderAdapter {
  readonly type: ImageGenerationProviderType;
  generateCharacterSheet(
    input: GenerateCharacterSheetInput
  ): Promise<GeneratedAsset>;
  generateStickerSheet(input: GenerateStickerSheetInput): Promise<GeneratedAsset>;
  regenerateStickerCell(
    input: RegenerateStickerCellInput
  ): Promise<GeneratedAsset>;
}
