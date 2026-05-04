import { randomUUID } from "node:crypto";

import type { ImageGenerationProviderAdapter } from "../providers/image-generation-provider";
import type {
  CreateGenerationJobInput,
  GenerateCharacterSheetInput,
  GeneratedAsset,
  GenerateStickerSheetInput,
  GenerationJob,
  RegenerateStickerCellInput,
} from "../types";
import type { GenerationJobStore } from "./generation-job-store";

export class GenerationJobService {
  constructor(
    private readonly store: GenerationJobStore,
    private readonly provider: ImageGenerationProviderAdapter
  ) {}

  async createJob(input: CreateGenerationJobInput) {
    const now = new Date().toISOString();
    const job: GenerationJob = {
      id: randomUUID(),
      projectId: input.projectId,
      type: input.type,
      status: "queued",
      provider: input.provider ?? this.provider.type,
      input: input.input,
      outputAssetIds: [],
      createdAt: now,
      updatedAt: now,
    };

    return this.store.create(job);
  }

  async processJob(jobId: string) {
    const job = await this.store.get(jobId);

    if (!job) {
      throw new Error(`Generation job not found: ${jobId}`);
    }

    if (job.status !== "queued") {
      return job;
    }

    await this.store.update(job.id, {
      status: "running",
      startedAt: new Date().toISOString(),
    });

    try {
      const asset = await this.runProvider(job);
      return this.store.update(job.id, {
        status: "succeeded",
        completedAt: new Date().toISOString(),
        outputAssetIds: [asset.id],
      });
    } catch (error) {
      return this.store.update(job.id, {
        status: "failed",
        completedAt: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async processNextQueuedJob() {
    const [job] = await this.store.list({ status: "queued" });
    if (!job) return null;
    return this.processJob(job.id);
  }

  private async runProvider(job: GenerationJob): Promise<GeneratedAsset> {
    switch (job.type) {
      case "generate-character-sheet":
        return this.provider.generateCharacterSheet(
          job.input as GenerateCharacterSheetInput
        );
      case "generate-sticker-sheet":
        return this.provider.generateStickerSheet(
          job.input as GenerateStickerSheetInput
        );
      case "regenerate-sticker-cell":
        return this.provider.regenerateStickerCell(
          job.input as RegenerateStickerCellInput
        );
      default:
        throw new Error(`Unsupported generation job type: ${job.type}`);
    }
  }
}
