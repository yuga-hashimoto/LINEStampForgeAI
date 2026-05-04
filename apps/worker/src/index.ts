import { resolve } from "node:path";

import { GenerationWorker } from "./generation-worker";

const worker = new GenerationWorker({
  cwd: resolve(process.cwd()),
  once: process.argv.includes("--once"),
});

worker.run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
