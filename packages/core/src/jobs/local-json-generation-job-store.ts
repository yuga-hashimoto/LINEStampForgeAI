import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { GenerationJob, GenerationJobStatus } from "../types";
import type { GenerationJobStore } from "./generation-job-store";

type GenerationJobStoreFile = {
  jobs: GenerationJob[];
};

export class LocalJsonGenerationJobStore implements GenerationJobStore {
  constructor(private readonly filePath = ".data/generation-jobs.json") {}

  async create(job: GenerationJob) {
    const data = await this.read();
    data.jobs.unshift(job);
    await this.write(data);
    return job;
  }

  async get(id: string) {
    const data = await this.read();
    return data.jobs.find((job) => job.id === id) ?? null;
  }

  async list(filters?: { projectId?: string; status?: GenerationJobStatus }) {
    const data = await this.read();
    return data.jobs.filter((job) => {
      if (filters?.projectId && job.projectId !== filters.projectId) return false;
      if (filters?.status && job.status !== filters.status) return false;
      return true;
    });
  }

  async update(id: string, patch: Partial<GenerationJob>) {
    const data = await this.read();
    const index = data.jobs.findIndex((job) => job.id === id);

    if (index === -1) {
      throw new Error(`Generation job not found: ${id}`);
    }

    const current = data.jobs[index];
    data.jobs[index] = {
      ...current,
      ...patch,
      type: current.type,
      input: current.input,
      updatedAt: new Date().toISOString(),
    } as GenerationJob;
    await this.write(data);
    return data.jobs[index];
  }

  private async read(): Promise<GenerationJobStoreFile> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      return JSON.parse(raw) as GenerationJobStoreFile;
    } catch {
      return { jobs: [] };
    }
  }

  private async write(data: GenerationJobStoreFile) {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(data, null, 2));
  }
}
