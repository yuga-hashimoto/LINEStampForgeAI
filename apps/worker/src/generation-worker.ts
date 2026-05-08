import {
  CodexAppServerImageProvider,
  GenerationJobService,
  LocalJsonGenerationJobStore,
} from "../../../packages/core/src";

import { CodexAppServerClient } from "./codex-app-server-client";

export type GenerationWorkerOptions = {
  cwd: string;
  once?: boolean;
  pollIntervalMs?: number;
};

export class GenerationWorker {
  constructor(private readonly options: GenerationWorkerOptions) {}

  async run() {
    const store = new LocalJsonGenerationJobStore();
    const client = new CodexAppServerClient({
      cwd: this.options.cwd,
      command: process.env.CODEX_APP_SERVER_COMMAND,
      args: process.env.CODEX_APP_SERVER_ARGS?.split(" "),
    });
    const provider = new CodexAppServerImageProvider({
      cwd: this.options.cwd,
      client,
      stopClientAfterEachRun: true,
    });
    const service = new GenerationJobService(store, provider);
    await service.requeueInterruptedRunningJobs();

    if (this.options.once) {
      await service.processNextQueuedJob();
      return;
    }

    const interval = this.options.pollIntervalMs ?? 3000;

    for (;;) {
      await service.processNextQueuedJob();
      await sleep(interval);
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
