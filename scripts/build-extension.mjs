import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const extensionDir = path.join(root, "extension");
const distDir = path.join(extensionDir, "dist");

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

const common = {
  bundle: true,
  minify: false,
  sourcemap: false,
  target: ["chrome120"],
  logLevel: "info",
};

await Promise.all([
  build({
    ...common,
    entryPoints: [path.join(extensionDir, "service-worker.ts")],
    outfile: path.join(distDir, "service-worker.js"),
    platform: "browser",
    format: "iife",
  }),
  build({
    ...common,
    entryPoints: [path.join(extensionDir, "content-script.ts")],
    outfile: path.join(distDir, "content-script.js"),
    platform: "browser",
    format: "iife",
  }),
  build({
    ...common,
    entryPoints: [path.join(extensionDir, "sidepanel.tsx")],
    outfile: path.join(distDir, "sidepanel.js"),
    platform: "browser",
    format: "iife",
    jsx: "automatic",
  }),
]);

console.log(`Chrome extension built: ${path.relative(root, distDir)}`);
