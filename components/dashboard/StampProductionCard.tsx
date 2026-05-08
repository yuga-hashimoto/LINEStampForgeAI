"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ImageUp,
  Loader2,
  LockKeyhole,
  RefreshCw,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { demoGeneratedAssetUrls, getGeneratedProjectAssetUrls } from "@/lib/generated-assets";
import type { Project, StickerCount, StickerDirection, TextMode } from "@/lib/types";

type GenerationJobStatus = "queued" | "running" | "succeeded" | "failed" | "canceled";

type GenerationJobView = {
  id: string;
  projectId: string;
  type: "generate-character-sheet" | "generate-sticker-sheet" | "regenerate-sticker-cell";
  status: GenerationJobStatus;
  input?: {
    stickerCount?: StickerCount;
    textMode?: TextMode;
    phrases?: Array<Partial<StickerDirection>>;
  };
  errorMessage?: string;
  updatedAt: string;
};

type StampProductionCardProps = {
  project: Project;
  characterApproved: boolean;
  stampApproved: boolean;
  stickerCount: StickerCount;
  textMode: TextMode;
  directions: StickerDirection[];
  onApprove: () => void;
  onAssetsUpdated: () => void;
  onCharacterReady: () => void;
  characterAssetsReady: boolean;
  stampAssetsReady: boolean;
  aiPlanReady: boolean;
};

const statusLabels: Record<GenerationJobStatus, string> = {
  queued: "待機中",
  running: "生成中",
  succeeded: "完了",
  failed: "失敗",
  canceled: "停止",
};

export function StampProductionCard({
  project,
  characterApproved,
  stampApproved,
  stickerCount,
  textMode,
  directions,
  onApprove,
  onAssetsUpdated,
  onCharacterReady,
  characterAssetsReady,
  stampAssetsReady,
  aiPlanReady,
}: StampProductionCardProps) {
  const [jobs, setJobs] = useState<GenerationJobView[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isApplyingFeedback, setIsApplyingFeedback] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const assets = useMemo(() => getGeneratedProjectAssetUrls(project.id), [project.id]);
  const activeJob = jobs.find(
    (job) => job.status === "queued" || job.status === "running"
  );

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

    if (sortedJobs.some((job) => job.type === "generate-character-sheet" && job.status === "succeeded")) {
      onCharacterReady();
    }

    const hasCurrentSucceededStickerJob = sortedJobs.some((job) =>
      job.type === "generate-sticker-sheet" &&
      job.status === "succeeded" &&
      isCurrentStickerJob(job, {
        directions,
        stickerCount,
        textMode,
      })
    );

    if (hasCurrentSucceededStickerJob) {
      onAssetsUpdated();
    }
  }, [directions, onAssetsUpdated, onCharacterReady, project.id, stickerCount, textMode]);

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

  const createStickerJob = async (feedbackInstruction?: string) => {
    if (!characterApproved) {
      toast.error("先にキャラクターシートを承認してください");
      return;
    }

    if (!characterAssetsReady) {
      toast.error("先にキャラクターシートを生成してください");
      return;
    }

    if (!aiPlanReady) {
      toast.error("先にテーマからAI設計案を作ってください");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/generation-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          type: "generate-sticker-sheet",
          input: {
            projectId: project.id,
            stickerCount,
            textMode,
            phrases: directions.slice(0, stickerCount).map((direction) => ({
              ...direction,
              directionNote: feedbackInstruction
                ? `${direction.directionNote} / 全体修正フィードバック: ${feedbackInstruction}`
                : direction.directionNote,
            })),
            characterSheetPath: `public${assets.characterSheet}`,
          },
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `HTTP ${response.status}`);
      }

      await refreshJobs();
      toast.success("スタンプシート生成を開始しました");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "生成ジョブの作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitFeedback = async () => {
    const trimmedFeedback = feedback.trim();
    if (!trimmedFeedback) {
      return;
    }

    setIsApplyingFeedback(true);
    try {
      await createStickerJob(trimmedFeedback);
      setFeedback("");
    } finally {
      setIsApplyingFeedback(false);
    }
  };

  const handleManualUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("assetType", "sticker-sheet");
      formData.append("projectId", project.id);
      formData.append("stickerCount", String(stickerCount));
      formData.append("file", file);

      const response = await fetch("/api/generated-assets", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        toast.error(body?.error ?? "スタンプシートの差し替えに失敗しました");
        return;
      }

      onAssetsUpdated();
      toast.success("スタンプシートを手動差し替えしました");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <Card className="overflow-hidden rounded-xl border-green-100 bg-white shadow-sm">
      <CardHeader className="border-b bg-gradient-to-r from-green-50 via-white to-white">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <WandSparkles className="line-green" aria-hidden="true" />
              承認済みキャラクターからスタンプを作る
            </CardTitle>
              <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">
                AIが作ったセリフと動きの設計案を確認してから、同じキャラクターでスタンプシートを生成します。
              </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="border-green-200 bg-green-50 text-green-700" variant="outline">
              {stickerCount}個セット
            </Badge>
            <Badge
              className={
                stampApproved
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }
              variant="outline"
            >
              {stampApproved ? "スタンプ承認済み" : "スタンプ未承認"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-5">
        <div className="grid gap-4 rounded-xl border bg-zinc-50 p-4">
          <div className="grid gap-4 lg:grid-cols-[140px_minmax(0,1fr)] lg:items-center">
            <div className="flex items-center justify-center rounded-xl border bg-white p-2">
              {characterAssetsReady ? (
                <GeneratedAssetImage
                  alt="承認済みキャラクター"
                  className="size-24"
                  fallbackSrc={demoGeneratedAssetUrls.characterViews.front}
                  imageClassName="object-contain"
                  src={assets.characterViews.front}
                />
              ) : (
                <div className="flex size-24 items-center justify-center rounded-lg bg-zinc-50 text-center text-xs font-black leading-5 text-muted-foreground">
                  シート生成待ち
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-base font-black leading-6 text-zinc-950 [overflow-wrap:anywhere]">
                使用キャラクター: {project.name}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">
                キャラクターシート承認後に、この参照画像を固定してスタンプ生成へ渡します。
              </p>
              {!characterApproved ? (
                <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800">
                  <LockKeyhole className="size-4" aria-hidden="true" />
                  キャラクター未承認のため生成不可
                </p>
              ) : null}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:justify-end">
            <Button
              className="h-auto min-h-11 rounded-xl px-4 py-2 text-sm font-black line-bg sm:min-w-[180px]"
              disabled={!characterApproved || !characterAssetsReady || !aiPlanReady || Boolean(activeJob) || isSubmitting}
              onClick={() => void createStickerJob()}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : (
                <WandSparkles data-icon="inline-start" />
              )}
              スタンプ生成
            </Button>
            <Button
              className="h-auto min-h-11 rounded-xl px-4 py-2 text-sm font-black sm:min-w-[180px]"
              disabled={!characterApproved || !stampAssetsReady}
              onClick={onApprove}
              variant={stampApproved ? "outline" : "default"}
            >
              <CheckCircle2 data-icon="inline-start" />
              {stampApproved ? "承認済み" : stampAssetsReady ? "このセットで承認" : "生成後に承認"}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-black text-zinc-800">スタンプ生成ジョブ</p>
            <Button
              className="h-9 rounded-lg"
              onClick={() => {
                void refreshJobs()
                  .then(() => toast.success("生成状態を更新しました"))
                  .catch(() => toast.error("生成状態を取得できませんでした"));
              }}
              size="sm"
              variant="outline"
            >
              <RefreshCw data-icon="inline-start" />
              更新
            </Button>
          </div>
          <div className="mt-3 grid gap-2">
            {jobs.filter((job) => job.type === "generate-sticker-sheet").length ? (
              jobs
                .filter((job) => job.type === "generate-sticker-sheet")
                .slice(0, 3)
                .map((job) => {
                  const isCurrentJob = isCurrentStickerJob(job, {
                    directions,
                    stickerCount,
                    textMode,
                  });

                  return (
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-zinc-50 px-3 py-2 text-sm"
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
                        <span>スタンプシート生成</span>
                      </div>
                      <span className="rounded-full border bg-white px-2 py-1 text-xs font-black">
                        {isCurrentJob ? statusLabels[job.status] : "過去の生成"}
                      </span>
                      {job.errorMessage ? (
                        <p className="w-full text-xs font-semibold text-amber-700">{job.errorMessage}</p>
                      ) : null}
                    </div>
                  );
                })
            ) : (
              <p className="rounded-lg border border-dashed bg-zinc-50 p-3 text-sm font-semibold leading-6 text-muted-foreground">
                キャラクターを承認したあと、セリフと動きを調整して「スタンプ生成」を実行します。
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3 rounded-xl border bg-white p-4">
          <div>
            <p className="text-sm font-black text-zinc-800">生成結果を直す</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">
              全体フィードバックでAI再生成するか、人間が編集したスタンプシートPNGを差し替えます。
            </p>
          </div>
          <textarea
            className="min-h-24 rounded-xl border bg-white px-3 py-3 text-sm font-semibold leading-6 text-zinc-700 outline-none focus-visible:border-green-400 focus-visible:ring-4 focus-visible:ring-green-100"
            disabled={!stampAssetsReady || isApplyingFeedback}
            onChange={(event) => setFeedback(event.target.value)}
            placeholder="例: 文字が小さいので全体的に大きく。左上の表情はもっと笑顔に。"
            value={feedback}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              className="h-auto min-h-11 rounded-xl px-4 py-2 text-sm font-black line-bg"
              disabled={!stampAssetsReady || !feedback.trim() || isApplyingFeedback || Boolean(activeJob)}
              onClick={submitFeedback}
              type="button"
            >
              {isApplyingFeedback ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : (
                <WandSparkles data-icon="inline-start" />
              )}
              AIに反映
            </Button>
            <label
              className={
                stampAssetsReady
                  ? "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-black text-zinc-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                  : "inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border bg-zinc-100 px-4 py-2 text-sm font-black text-zinc-400"
              }
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ImageUp className="size-4" aria-hidden="true" />
              )}
              PNGを差し替え
              <input
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                disabled={!stampAssetsReady || isUploading}
                onChange={handleManualUpload}
                type="file"
              />
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function isCurrentStickerJob(job: GenerationJobView, current: {
  directions: StickerDirection[];
  stickerCount: StickerCount;
  textMode: TextMode;
}) {
  const input = job.input;

  if (!input || input.stickerCount !== current.stickerCount || input.textMode !== current.textMode) {
    return false;
  }

  const inputPhrases = input.phrases?.slice(0, current.stickerCount) ?? [];
  const currentPhrases = current.directions.slice(0, current.stickerCount);

  if (inputPhrases.length !== currentPhrases.length) {
    return false;
  }

  return currentPhrases.every((direction, index) => {
    const phrase = inputPhrases[index];

    return (
      phrase?.text === direction.text &&
      phrase?.textColor === direction.textColor &&
      phrase?.speechShape === direction.speechShape &&
      phrase?.speechStyle === direction.speechStyle &&
      phrase?.characterMotion === direction.characterMotion
    );
  });
}
