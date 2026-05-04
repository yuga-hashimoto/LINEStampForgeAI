import type {
  GenerateCharacterSheetInput,
  GeneratedAsset,
  GenerateStickerSheetInput,
  RegenerateStickerCellInput,
} from "../types";
import type { ImageGenerationProviderAdapter } from "./image-generation-provider";

export class OpenRouterImageProvider implements ImageGenerationProviderAdapter {
  readonly type = "openrouter" as const;

  async generateCharacterSheet(
    _input: GenerateCharacterSheetInput
  ): Promise<GeneratedAsset> {
    void _input;
    throw new Error("OpenRouter image generation is a future adapter stub.");
  }

  async generateStickerSheet(
    _input: GenerateStickerSheetInput
  ): Promise<GeneratedAsset> {
    void _input;
    throw new Error("OpenRouter image generation is a future adapter stub.");
  }

  async regenerateStickerCell(
    _input: RegenerateStickerCellInput
  ): Promise<GeneratedAsset> {
    void _input;
    throw new Error("OpenRouter image generation is a future adapter stub.");
  }
}
