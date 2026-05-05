"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  RefreshCw,
  Scissors,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGeneratedProjectAssetUrls } from "@/lib/generated-assets";
import type { Project, StickerCount, StickerPhrase, TextMode } from "@/lib/types";

type GenerationJobStatus = "queued" | "running" | "succeeded" | "failed" | "canceled";

type GenerationJobType =
  | "generate-character-sheet"
  | "generate-sticker-sheet"
  | "regenerate-sticker-cell";

type GenerationJobView = {
  id: string;
  projectId: string;
  type: GenerationJobType;
  status: GenerationJobStatus;
  errorMessage?: string;
  updatedAt: string;
  completedAt?: string;
};

type GenerationStudioCardProps = {
  project: Project;
  stickerCount: StickerCount;
  textMode: TextMode;
  phrases: StickerPhrase[];
  onAssetsUpdated: () => void;
};

const jobLabels: Record<GenerationJobType, string> = {
  "generate-character-sheet": "キャラクターシート生成",
  "generate-sticker-sheet": "スタンプシート生成",
  "regenerate-sticker-cell": "特定コマ再生成",
};

const statusLabels: Record<GenerationJobStatus, string> = {
  queued: "待機中",
  running: "生成中",
  succeeded: "完了",
  failed: "失敗",
  canceled: "停止",
};

export function GenerationStudioCard({
  project,
  stickerCount,
  textMode,
  phrases,
  onAssetsUpdated,
}: GenerationStudioCardProps) {
  const [jobs, setJobs] = useState<GenerationJobView[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<GenerationJobType | null>(null);
  const [characterBrief, setCharacterBrief] = useState(
    "白いうさぎのマジシャン。黒いシルクハット、オレンジの花飾り、黒とオレンジのマント、丸い黒目、ピンクの耳内側を必ず維持。日常会話で使いやすいかわいい表情。"
  );

  const latestJob = jobs[0];
  const activeJob = jobs.find((job) => job.status === "queued" || job.status === "running");
  const assets = useMemo(() => getGeneratedProjectAssetUrls(project.id), [project.id]);

  const refreshJobs = useCallback(async () => {
    const response = await fetch(`/api/generation-jobs?projectId=${encodeURIComponent(project.id)}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = (await response.json()) as { jobs: GenerationJobView[] };
    const sortedJobs = [...result.jobs].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setJobs(sortedJobs);

    if (sortedJobs.some((job) => job.status === "succeeded")) {
      onAssetsUpdated();
    }
  }, [onAssetsUpdated, project.id]);

  useEffect(() => {
    void refreshJobs().catch(() => undefined);
  }, [refreshJobs]);

  useEffect(() => {
    if (!activeJob) {
      return;
    }

    const id = window.setInterval(() => {
      void refreshJobs().catch(() => undefined);
    }, 3000);

    return () => window.clearInterval(id);
  }, [activeJob, refreshJobs]);

  const createGenerationJob = async (type: Exclude<GenerationJobType, "regenerate-sticker-cell">) => {
    setIsSubmitting(type);

    try {
      const input =
        type === "generate-character-sheet"
          ? {
              projectId: project.id,
              characterType: "白うさぎ",
              style: "LINE Creators Market向けのかわいいマジシャン風スタンプキャラクター",
              colorTheme: "白、黒、LINEグリーン、ピンク、オレンジ、黄色",
              costumeAndProps: "黒いシルクハット、オレンジの花飾り、黒とオレンジのマント、星のステッキ",
              personality: "明るく丁寧。あいさつ、感謝、確認、応援に使いやすい表情。",
              mustKeepFeatures: characterBrief,
            }
          : {
              projectId: project.id,
              stickerCount,
              textMode,
              phrases: phrases.slice(0, stickerCount),
              characterSheetPath: `public${assets.characterSheet}`,
            };

      const response = await fetch("/api/generation-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          type,
          input,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `HTTP ${response.status}`);
      }

      await refreshJobs();
      toast.success(`${jobLabels[type]}をキューに追加しました`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "生成ジョブの作成に失敗しました");
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <Card className="overflow-hidden rounded-xl border-green-100 bg-white shadow-sm">
      <CardHeader className="border-b bg-gradient-to-r from-green-50 via-white to-white">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <WandSparkles className="line-green" aria-hidden="true" />
              キャラクターシートから作る
            </CardTitle>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">
              まずキャラクターシートを固定し、その同じキャラからスタンプシート、切り出しPNG、ZIPまで作ります。
            </p>
          </div>
          <div className="rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-black text-green-700">
            imagegen接続済み
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-5">
        <label className="grid gap-2 text-sm font-black text-zinc-800">
          キャラクター固定メモ
          <textarea
            className="min-h-20 rounded-xl border bg-white px-3 py-3 text-sm font-semibold leading-6 text-zinc-700 outline-none focus-visible:border-green-400 focus-visible:ring-4 focus-visible:ring-green-100"
            onChange={(event) => setCharacterBrief(event.target.value)}
            value={characterBrief}
          />
        </label>

        <div className="grid gap-3">
          <GenerationStep
            description="参照用の正面・横・後ろ・表情差分を作成"
            icon={<ImagePlus aria-hidden="true" />}
            label="1. キャラ作成"
          >
            <Button
              className="h-auto min-h-11 w-full whitespace-normal rounded-xl px-4 py-2 text-sm font-black leading-5 line-bg"
              disabled={Boolean(activeJob) || isSubmitting !== null}
              onClick={() => createGenerationJob("generate-character-sheet")}
            >
              {isSubmitting === "generate-character-sheet" ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : (
                <WandSparkles data-icon="inline-start" />
              )}
              キャラ生成
            </Button>
          </GenerationStep>

          <GenerationStep
            description={`${stickerCount}個 / ${textModeLabel(textMode)}で同一キャラのスタンプを作成`}
            icon={<WandSparkles aria-hidden="true" />}
            label="2. スタンプ生成"
          >
            <Button
              className="h-auto min-h-11 w-full whitespace-normal rounded-xl px-4 py-2 text-sm font-black leading-5 line-bg"
              disabled={Boolean(activeJob) || isSubmitting !== null}
              onClick={() => createGenerationJob("generate-sticker-sheet")}
            >
              {isSubmitting === "generate-sticker-sheet" ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : (
                <WandSparkles data-icon="inline-start" />
              )}
              スタンプを生成
            </Button>
          </GenerationStep>

          <GenerationStep
            description="生成シートをセルに切り出し、ZIP書き出しで使うPNGに更新"
            icon={<Scissors aria-hidden="true" />}
            label="3. 切り出し反映"
          >
            <Button
              className="h-auto min-h-11 w-full whitespace-normal rounded-xl px-4 py-2 text-sm font-black leading-5"
              onClick={() => {
                void refreshJobs()
                  .then(() => toast.success("生成状態を更新しました"))
                  .catch(() => toast.error("生成状態を取得できませんでした"));
              }}
              variant="outline"
            >
              <RefreshCw data-icon="inline-start" />
              状態を更新
            </Button>
          </GenerationStep>
        </div>

        <div className="rounded-xl border bg-zinc-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-black text-zinc-800">生成ジョブ</p>
            <p className="text-xs font-semibold text-muted-foreground">
              workerを起動している間に順番に処理されます。
            </p>
          </div>
          {latestJob ? (
            <div className="mt-3 grid gap-2">
              {jobs.slice(0, 3).map((job) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2 text-sm"
                  key={job.id}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {job.status === "succeeded" ? (
                      <CheckCircle2 className="size-4 text-green-600" aria-hidden="true" />
                    ) : job.status === "failed" ? (
                      <AlertTriangle className="size-4 text-amber-600" aria-hidden="true" />
                    ) : (
                      <Loader2 className="size-4 animate-spin text-green-600" aria-hidden="true" />
                    )}
                    <span>{jobLabels[job.type]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border bg-zinc-50 px-2 py-1 text-xs font-black">
                      {statusLabels[job.status]}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {new Intl.DateTimeFormat("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(job.updatedAt))}
                    </span>
                  </div>
                  {job.errorMessage ? (
                    <p className="w-full text-xs font-semibold text-amber-700">{job.errorMessage}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-lg border border-dashed bg-white p-3 text-sm font-semibold leading-6 text-muted-foreground">
              まだ生成ジョブはありません。「キャラ作成」または「このキャラで作る」から開始できます。
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function GenerationStep({
  children,
  description,
  icon,
  label,
}: {
  children: ReactNode;
  description: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="grid gap-4 rounded-xl border bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-base font-black text-zinc-950">
          <span className="flex size-9 items-center justify-center rounded-lg bg-green-50 text-green-700">
            {icon}
          </span>
          {label}
        </div>
        <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">{description}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function textModeLabel(mode: TextMode) {
  if (mode === "ai") {
    return "AI文字";
  }

  if (mode === "overlay") {
    return "あと乗せ";
  }

  return "ハイブリッド";
}
