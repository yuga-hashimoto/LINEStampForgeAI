import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import {
  deriveCharacterSheetViewAssets,
  sliceStickerSheetAsset,
} from "../image-slicing";
import {
  getCharacterSheetAssetPath,
  getCharacterSheetPromptPath,
  getRegeneratedCellAssetPath,
  getRegeneratedCellPromptPath,
  getStickerSheetAssetPath,
  getStickerSheetPromptPath,
  toPublicGeneratedUrl,
} from "../paths";
import {
  buildCharacterSheetCodexPrompt,
  buildRegenerateStickerCellCodexPrompt,
  buildStickerSheetCodexPrompt,
} from "../prompts";
import type {
  CodexThread,
  CodexTurn,
  CodexTurnResult,
  GenerateCharacterSheetInput,
  GeneratedAsset,
  GenerateStickerSheetInput,
  RegenerateStickerCellInput,
  StartThreadOptions,
  StartTurnOptions,
} from "../types";
import type { ImageGenerationProviderAdapter } from "./image-generation-provider";

export type CodexAppServerClientLike = {
  start(): Promise<void>;
  initialize(): Promise<void>;
  startThread(options: StartThreadOptions): Promise<CodexThread>;
  startTurn(options: StartTurnOptions): Promise<CodexTurn>;
  waitForTurnCompletion(turnId: string): Promise<CodexTurnResult>;
  stop(): Promise<void>;
};

export type CodexAppServerImageProviderOptions = {
  client: CodexAppServerClientLike;
  cwd: string;
  stopClientAfterEachRun?: boolean;
};

export class CodexAppServerImageProvider
  implements ImageGenerationProviderAdapter
{
  readonly type = "codex-app-server" as const;

  constructor(private readonly options: CodexAppServerImageProviderOptions) {}

  async generateCharacterSheet(input: GenerateCharacterSheetInput) {
    const outputPath = getCharacterSheetAssetPath(input.projectId);
    const promptLogPath = getCharacterSheetPromptPath(input.projectId);
    const prompt = buildCharacterSheetCodexPrompt(input);

    await this.runCodexTurn({
      projectId: input.projectId,
      title: "Generate character sheet",
      prompt,
      outputPath,
      promptLogPath,
    });
    await deriveCharacterSheetViewAssets({
      cwd: this.options.cwd,
      projectId: input.projectId,
      sheetPath: outputPath,
    });

    return this.createAsset({
      projectId: input.projectId,
      kind: "character-sheet",
      path: outputPath,
      promptLogPath,
    });
  }

  async generateStickerSheet(input: GenerateStickerSheetInput) {
    const outputPath = getStickerSheetAssetPath(input.projectId, input.stickerCount);
    const promptLogPath = getStickerSheetPromptPath(
      input.projectId,
      input.stickerCount
    );
    const prompt = buildStickerSheetCodexPrompt(input);

    await this.runCodexTurn({
      projectId: input.projectId,
      title: `Generate ${input.stickerCount} sticker sheet`,
      prompt,
      outputPath,
      promptLogPath,
    });
    await sliceStickerSheetAsset({
      cwd: this.options.cwd,
      projectId: input.projectId,
      stickerCount: input.stickerCount,
      sheetPath: outputPath,
    });

    return this.createAsset({
      projectId: input.projectId,
      kind: "sticker-sheet",
      path: outputPath,
      promptLogPath,
      metadata: {
        stickerCount: input.stickerCount,
        textMode: input.textMode,
      },
    });
  }

  async regenerateStickerCell(input: RegenerateStickerCellInput) {
    const outputPath = getRegeneratedCellAssetPath(
      input.projectId,
      input.targetCell
    );
    const promptLogPath = getRegeneratedCellPromptPath(
      input.projectId,
      input.targetCell
    );
    const prompt = buildRegenerateStickerCellCodexPrompt(input);

    await this.runCodexTurn({
      projectId: input.projectId,
      title: `Regenerate sticker cell ${input.targetCell}`,
      prompt,
      outputPath,
      promptLogPath,
    });

    return this.createAsset({
      projectId: input.projectId,
      kind: "regenerated-cell",
      path: outputPath,
      promptLogPath,
      metadata: {
        targetCell: input.targetCell,
      },
    });
  }

  private async runCodexTurn(options: {
    projectId: string;
    title: string;
    prompt: string;
    outputPath: string;
    promptLogPath: string;
  }) {
    const { client, cwd, stopClientAfterEachRun = false } = this.options;

    await ensureParentDir(resolve(cwd, options.outputPath));
    await ensureParentDir(resolve(cwd, options.promptLogPath));
    await writeFile(resolve(cwd, options.promptLogPath), options.prompt);

    try {
      await client.start();
      await client.initialize();
      const thread = await client.startThread({
        cwd,
        title: options.title,
        metadata: {
          projectId: options.projectId,
          backend: "codex-app-server",
        },
      });
      const turn = await client.startTurn({
        threadId: thread.id,
        prompt: options.prompt,
        cwd,
      });
      const result = await client.waitForTurnCompletion(turn.id);

      if (result.status !== "completed") {
        throw new Error(result.errorMessage ?? `Codex turn failed: ${turn.id}`);
      }
    } finally {
      if (stopClientAfterEachRun) {
        await client.stop();
      }
    }
  }

  private createAsset(input: {
    projectId: string;
    kind: GeneratedAsset["kind"];
    path: string;
    promptLogPath: string;
    metadata?: GeneratedAsset["metadata"];
  }): GeneratedAsset {
    return {
      id: randomUUID(),
      projectId: input.projectId,
      kind: input.kind,
      provider: this.type,
      path: input.path,
      publicUrl: toPublicGeneratedUrl(input.path),
      promptLogPath: input.promptLogPath,
      createdAt: new Date().toISOString(),
      metadata: input.metadata,
    };
  }
}

async function ensureParentDir(path: string) {
  await mkdir(dirname(path), { recursive: true });
}
