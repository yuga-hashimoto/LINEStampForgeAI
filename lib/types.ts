export type StickerCount = 8 | 16 | 24 | 32 | 40;

export type TextMode = "ai" | "overlay" | "hybrid";

export type ProjectStatus = "draft" | "generating" | "review_ready" | "exported";

export type WorkflowStepStatus = "done" | "active" | "pending";

export type CheckStatus = "pass" | "warning" | "fail";

export type CheckItem = {
  id: string;
  label: string;
  description?: string;
  status: CheckStatus;
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

export type CharacterDesignDraft = {
  characterType: string;
  description: string;
  referenceImages?: ReferenceImageAsset[];
  referenceImageName?: string;
  referenceImageUrl?: string;
  referenceImageMimeType?: string;
  referenceImageSizeBytes?: number;
  artStyle: string;
  lineWeight: string;
  colorTheme: string;
  costumeAndProps: string;
  personality: string;
  mustKeepFeatures: string;
};

export type StickerDirection = StickerPhrase & {
  textColor: string;
  speechShape: string;
  speechStyle: string;
  characterMotion: string;
  directionNote: string;
};

export type CharacterSheetItem = {
  id: string;
  label: string;
  angle: string;
  description: string;
  palette?: string[];
};

export type StickerPreviewItem = {
  id: number;
  phrase: StickerPhrase;
  effect: string;
  checkStatus: CheckStatus;
};

export type PricingPlan = {
  id: string;
  name: string;
  stickerCount: StickerCount;
  price: number;
  popular?: boolean;
  description: string;
  features: string[];
  includedRegenerations: number;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  priceMonthly: number;
  description: string;
  features: string[];
  exportLimit: string;
  credits: number;
  recommended?: boolean;
};

export type AddOnOption = {
  id: string;
  name: string;
  priceLabel: string;
  description: string;
};

export type WorkflowStep = {
  id: number;
  label: string;
  status: WorkflowStepStatus;
};

export type Project = {
  id: string;
  name: string;
  studioName: string;
  status: ProjectStatus;
  stickerCount: StickerCount;
  textMode: TextMode;
  zipSizeEstimateMb: number;
};

export type ProjectCreationDraft = {
  id: string;
  name: string;
  studioName: string;
  status: ProjectStatus;
  stickerCount: StickerCount;
  textMode: TextMode;
  characterType: string;
  referenceImages?: ReferenceImageAsset[];
  referenceImageName?: string;
  referenceImageUrl?: string;
  referenceImageMimeType?: string;
  referenceImageSizeBytes?: number;
  characterDescription?: string;
  mustKeepFeatures?: string;
  style: string;
  colorTheme: string;
  costumeAndProps: string;
  personality: string;
  usageScene: string;
  title: {
    ja: string;
    en?: string;
  };
  description: {
    ja: string;
    en?: string;
  };
  creatorName: string;
  copyright: string;
  containsAiGeneratedContent: boolean;
  phrases: string[];
  createdAt: string;
  updatedAt: string;
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

export type GenerateCharacterSheetResult = {
  projectId: string;
  sheetId: string;
  items: CharacterSheetItem[];
  provider: "mock" | "codex-app-server" | "openrouter" | "openai-images";
  generatedAt: string;
};

export type GenerateStickerSheetInput = {
  projectId: string;
  stickerCount: StickerCount;
  textMode: TextMode;
  phrases: StickerPhrase[];
  characterSheetId: string;
};

export type GenerateStickerSheetResult = {
  sheetId: string;
  stickerCount: StickerCount;
  previewItems: StickerPreviewItem[];
  provider: "mock" | "codex-app-server" | "openrouter" | "openai-images";
  generatedAt: string;
};

export type RegenerateStickerCellInput = {
  projectId: string;
  sheetId: string;
  targetCell: number;
  fixInstruction: string;
};

export type OverlayStickerTextInput = {
  projectId: string;
  stickerId: number;
  text: string;
  fontStyle?: "bold" | "rounded" | "handwritten";
};

export type SliceStickerSheetInput = {
  projectId: string;
  sheetId: string;
  stickerCount: StickerCount;
};

export type SliceStickerSheetResult = {
  projectId: string;
  stickerCount: StickerCount;
  imageNames: string[];
  mainImageName: string;
  tabImageName: string;
};

export type RunChecksInput = {
  projectId: string;
  imageNames: string[];
};

export type ExportZipInput = {
  project: Project;
  phrases: StickerPhrase[];
  checks: CheckItem[];
};

export type ExportZipResult = {
  fileName: string;
  blob: Blob;
  sizeMb: number;
};

export type SubmissionManifest = {
  projectId: string;
  stickerType: "static";
  stickerCount: StickerCount;
  title: {
    ja: string;
    en?: string;
  };
  description: {
    ja: string;
    en?: string;
  };
  creatorName: string;
  copyright: string;
  containsAiGeneratedContent: boolean;
  zipUrl: string;
  mainImageUrl?: string;
  tabImageUrl?: string;
  checks: {
    png: boolean;
    transparentBackground: boolean;
    stickerSizeWithin370x320: boolean;
    mainImage240x240: boolean;
    tabImage96x74: boolean;
    fileSizeWithin1MB: boolean;
    zipWithin60MB: boolean;
    evenPixels: boolean;
    marginAround10px: boolean;
    advertisingRisk: boolean;
    rightsRisk: boolean;
  };
};

export type SubmissionPackDraft = {
  project: Project;
  checks: CheckItem[];
  title: SubmissionManifest["title"];
  description: SubmissionManifest["description"];
  creatorName: string;
  copyright: string;
  containsAiGeneratedContent: boolean;
};

export type SubmissionPackTokenResponse = {
  token: string;
  manifestUrl: string;
  zipUrl: string;
  expiresAt: string;
  manifest: SubmissionManifest;
};
