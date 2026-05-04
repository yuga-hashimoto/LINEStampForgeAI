import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";

import type {
  CodexThread,
  CodexTurn,
  CodexTurnResult,
  StartThreadOptions,
  StartTurnOptions,
} from "../../../packages/core/src";

type JsonRpcId = string | number;

type JsonRpcMessage = {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: {
    code?: number;
    message?: string;
    data?: unknown;
  };
};

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
};

export type CodexAppServerClientOptions = {
  command?: string;
  args?: string[];
  cwd: string;
  turnTimeoutMs?: number;
};

export class CodexAppServerClient {
  private process: ChildProcessWithoutNullStreams | null = null;
  private pendingRequests = new Map<JsonRpcId, PendingRequest>();
  private readonly events = new EventEmitter();
  private buffer = "";
  private requestCounter = 0;

  constructor(private readonly options: CodexAppServerClientOptions) {}

  async start(): Promise<void> {
    if (this.process) return;

    const command =
      this.options.command ??
      process.env.CODEX_APP_SERVER_COMMAND ??
      "codex";
    const args = this.options.args ?? ["app-server"];

    this.process = spawn(command, args, {
      cwd: this.options.cwd,
      env: process.env,
      stdio: "pipe",
    });

    this.process.stdout.on("data", (chunk: Buffer) => {
      this.handleStdout(chunk.toString("utf8"));
    });

    this.process.stderr.on("data", (chunk: Buffer) => {
      this.events.emit("stderr", chunk.toString("utf8"));
    });

    this.process.on("exit", (code, signal) => {
      const error = new Error(
        `Codex app-server exited with code ${code ?? "null"} and signal ${
          signal ?? "null"
        }`
      );
      for (const pending of this.pendingRequests.values()) {
        pending.reject(error);
      }
      this.pendingRequests.clear();
      this.process = null;
      this.events.emit("exit", { code, signal });
    });
  }

  async initialize(): Promise<void> {
    await this.request("initialize", {
      protocolVersion: "2026-05-04",
      clientInfo: {
        name: "line-stamp-forge-ai-worker",
        version: "0.1.0",
      },
    });
    this.notify("initialized", {});
  }

  async startThread(options: StartThreadOptions): Promise<CodexThread> {
    const result = await this.request("thread/start", {
      cwd: options.cwd,
      title: options.title,
      metadata: options.metadata,
    });
    const resultObject = asRecord(result);
    const id = asString(resultObject.id) ?? asString(resultObject.threadId);

    if (!id) {
      throw new Error("thread/start did not return a thread id");
    }

    return { id };
  }

  async startTurn(options: StartTurnOptions): Promise<CodexTurn> {
    const result = await this.request("turn/start", {
      threadId: options.threadId,
      cwd: options.cwd,
      items: [
        {
          type: "text",
          text: options.prompt,
        },
      ],
    });
    const resultObject = asRecord(result);
    const id = asString(resultObject.id) ?? asString(resultObject.turnId);

    if (!id) {
      throw new Error("turn/start did not return a turn id");
    }

    return {
      id,
      threadId: options.threadId,
    };
  }

  async waitForTurnCompletion(turnId: string): Promise<CodexTurnResult> {
    const timeoutMs = this.options.turnTimeoutMs ?? 15 * 60 * 1000;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const result = await this.waitForTurnEvent(turnId, deadline - Date.now());
      if (result) return result;
    }

    return {
      turnId,
      status: "failed",
      generatedFiles: [],
      errorMessage: `Timed out waiting for Codex turn ${turnId}`,
    };
  }

  async stop(): Promise<void> {
    if (!this.process) return;

    const child = this.process;
    this.process = null;
    child.kill("SIGTERM");
  }

  private request(method: string, params: unknown): Promise<unknown> {
    const id = `${Date.now()}-${++this.requestCounter}`;
    this.write({
      jsonrpc: "2.0",
      id,
      method,
      params,
    });

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
    });
  }

  private notify(method: string, params: unknown) {
    this.write({
      jsonrpc: "2.0",
      method,
      params,
    });
  }

  private write(message: JsonRpcMessage) {
    if (!this.process) {
      throw new Error("Codex app-server is not started");
    }

    this.process.stdin.write(`${JSON.stringify(message)}\n`);
  }

  private handleStdout(chunk: string) {
    this.buffer += chunk;
    const lines = this.buffer.split(/\r?\n/);
    this.buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      this.handleMessageLine(line);
    }
  }

  private handleMessageLine(line: string) {
    let message: JsonRpcMessage;

    try {
      message = JSON.parse(line) as JsonRpcMessage;
    } catch {
      this.events.emit("log", line);
      return;
    }

    if (message.id !== undefined && this.pendingRequests.has(message.id)) {
      const pending = this.pendingRequests.get(message.id);
      if (!pending) return;
      this.pendingRequests.delete(message.id);

      if (message.error) {
        pending.reject(new Error(message.error.message ?? "JSON-RPC error"));
        return;
      }

      pending.resolve(message.result);
      return;
    }

    if (message.method) {
      this.events.emit(message.method, message.params);
      this.events.emit("event", {
        method: message.method,
        params: message.params,
      });
    }
  }

  private waitForTurnEvent(
    turnId: string,
    timeoutMs: number
  ): Promise<CodexTurnResult | null> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        cleanup();
        resolve(null);
      }, Math.min(timeoutMs, 5000));

      const onEvent = (event: unknown) => {
        const result = normalizeTurnResult(turnId, event);
        if (!result) return;
        cleanup();
        resolve(result);
      };

      const cleanup = () => {
        clearTimeout(timeout);
        this.events.off("event", onEvent);
      };

      this.events.on("event", onEvent);
    });
  }
}

function normalizeTurnResult(
  turnId: string,
  event: unknown
): CodexTurnResult | null {
  const eventObject = asRecord(event);
  const params = asRecord(eventObject.params);
  const method = asString(eventObject.method);
  const eventTurnId =
    asString(params.turnId) ?? asString(params.id) ?? asString(eventObject.turnId);

  if (eventTurnId !== turnId) return null;

  const rawStatus =
    asString(params.status) ?? asString(params.state) ?? asString(eventObject.status);
  const completed =
    method === "turn/completed" ||
    rawStatus === "completed" ||
    rawStatus === "succeeded";
  const failed =
    method === "turn/failed" || rawStatus === "failed" || rawStatus === "error";
  const canceled = method === "turn/canceled" || rawStatus === "canceled";

  if (!completed && !failed && !canceled) return null;

  return {
    turnId,
    status: completed ? "completed" : canceled ? "canceled" : "failed",
    outputText: asString(params.outputText) ?? asString(params.text),
    generatedFiles: normalizeStringArray(params.generatedFiles),
    errorMessage: asString(params.errorMessage) ?? asString(params.message),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function createLocalCodexThreadId() {
  return `thread_${randomUUID()}`;
}
