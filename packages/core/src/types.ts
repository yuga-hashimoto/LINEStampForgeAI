export type StickerCount = 8 | 16 | 24 | 32 | 40;

export type TextMode = "ai" | "overlay" | "hybrid";

export type ImageGenerationProviderType =
  | "codex-app-server"
  | "openrouter"
  | "openai-images";

export type GeneratedAssetKind =
  | "character-sheet"
  | "sticker-sheet"
  | "regenerated-cell";

export type GeneratedAsset = {
  id: string;
  projectId: string;
  kind: GeneratedAssetKind;
  provider: ImageGenerationProviderType;
  path: string;
  publicUrl: string;
  promptLogPath: string;
  width?: number;
  height?: number;
  createdAt: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type StickerPhrase = {
  id: number;
  text: string;
  emotion: string;
  pose: string;
  prop?: string;
  textColor?: string;
  speechShape?: string;
  speechStyle?: string;
  characterMotion?: string;
  directionNote?: string;
};

export type ReferenceImageAsset = {
  name: string;
  url: string;
  mimeType: string;
  sizeBytes?: number;
};

export type GenerateCharacterSheetInput = {
  projectId: string;
  characterType: string;
  style: string;
  colorTheme: string;
  costumeAndProps: string;
  personality: string;
  mustKeepFeatures: string;
  referenceImages?: ReferenceImageAsset[];
  referenceImageName?: string;
  referenceImageUrl?: string;
  referenceImageMimeType?: string;
  referenceImageSizeBytes?: number;
};

export type GenerateStickerSheetInput = {
  projectId: string;
  stickerCount: StickerCount;
  textMode: TextMode;
  phrases: StickerPhrase[];
  characterSheetAssetId?: string;
  characterSheetPath?: string;
};

export type RegenerateStickerCellInput = {
  projectId: string;
  stickerSheetAssetId?: string;
  stickerSheetPath?: string;
  characterSheetAssetId?: string;
  characterSheetPath?: string;
  targetCell: number;
  fixInstruction: string;
};

export type GenerationJobType =
  | "generate-character-sheet"
  | "generate-sticker-sheet"
  | "regenerate-sticker-cell";

export type GenerationJobStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "canceled";

export type GenerationJobInput =
  | GenerateCharacterSheetInput
  | GenerateStickerSheetInput
  | RegenerateStickerCellInput;

export type GenerationJob = {
  id: string;
  projectId: string;
  type: GenerationJobType;
  status: GenerationJobStatus;
  provider: ImageGenerationProviderType;
  input: GenerationJobInput;
  outputAssetIds: string[];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
};

export type CreateGenerationJobInput = {
  projectId: string;
  type: GenerationJobType;
  provider?: ImageGenerationProviderType;
  input: GenerationJobInput;
};

export type StartThreadOptions = {
  cwd: string;
  title?: string;
  metadata?: Record<string, unknown>;
};

export type CodexThread = {
  id: string;
};

export type StartTurnOptions = {
  threadId: string;
  prompt: string;
  cwd: string;
};

export type CodexTurn = {
  id: string;
  threadId: string;
};

export type CodexTurnResult = {
  turnId: string;
  status: "completed" | "failed" | "canceled";
  outputText?: string;
  generatedFiles: string[];
  errorMessage?: string;
};
