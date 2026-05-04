import type { GenerationJob, GenerationJobStatus } from "../types";

export interface GenerationJobStore {
  create(job: GenerationJob): Promise<GenerationJob>;
  get(id: string): Promise<GenerationJob | null>;
  list(filters?: {
    projectId?: string;
    status?: GenerationJobStatus;
  }): Promise<GenerationJob[]>;
  update(id: string, patch: Partial<GenerationJob>): Promise<GenerationJob>;
}
