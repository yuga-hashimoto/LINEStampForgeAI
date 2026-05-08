"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Upload,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArtStyleReferencePreview, LineWeightReferencePreview } from "@/components/ui/StyleReferencePreview";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { characterArtStyles, lineWeightOptions } from "@/lib/constants";
import type { CharacterDesignDraft, Project, ReferenceImageAsset } from "@/lib/types";

type GenerationJobStatus = "queued" | "running" | "succeeded" | "failed" | "canceled";

type GenerationJobView = {
  id: string;
  projectId: string;
  type: "generate-character-sheet" | "generate-sticker-sheet" | "regenerate-sticker-cell";
  status: GenerationJobStatus;
  errorMessage?: string;
  updatedAt: string;
};

type GenerationStudioCardProps = {
  project: Project;
  characterDesign: CharacterDesignDraft;
  isApproved: boolean;
  onChange: (nextDesign: CharacterDesignDraft) => void;
  onApprove: () => void;
  onAssetsUpdated: () => void;
  onGenerationStateChange?: (state: "generating" | "succeeded" | "failed") => void;
  assetsReady: boolean;
};

const statusLabels: Record<GenerationJobStatus, string> = {
  queued: "待機中",
  running: "生成中",
  succeeded: "完了",
  failed: "失敗",
  canceled: "停止",
};

function getReferenceImages(characterDesign: CharacterDesignDraft): ReferenceImageAsset[] {
  if (characterDesign.referenceImages?.length) {
    return characterDesign.referenceImages.slice(0, 3);
  }

  if (characterDesign.referenceImageName && characterDesign.referenceImageUrl) {
    return [
      {
        name: characterDesign.referenceImageName,
        url: characterDesign.referenceImageUrl,
        mimeType: characterDesign.referenceImageMimeType ?? "image/png",
        sizeBytes: characterDesign.referenceImageSizeBytes,
      },
    ];
  }

  return [];
}

export function GenerationStudioCard({
  project,
  characterDesign,
  isApproved,
  onChange,
  onApprove,
  onAssetsUpdated,
  onGenerationStateChange,
  assetsReady,
}: GenerationStudioCardProps) {
  const [jobs, setJobs] = useState<GenerationJobView[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previousJobsRef = useRef<GenerationJobView[]>([]);
  const referenceImages = getReferenceImages(characterDesign);
  const primaryReferenceImage = referenceImages[0];

  const activeJob = jobs.find(
    (job) =>
      job.type === "generate-character-sheet" &&
      (job.status === "queued" || job.status === "running")
  );
  const latestCharacterJob = jobs.find((job) => job.type === "generate-character-sheet");
  const isProjectGenerating = project.status === "generating";

  const updateDesign = (patch: Partial<CharacterDesignDraft>) => {
    onChange({ ...characterDesign, ...patch });
  };

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
    const hadActiveCharacterJob = previousJobsRef.current.some(
      (job) =>
        job.type === "generate-character-sheet" &&
        (job.status === "queued" || job.status === "running")
    );

    setJobs(sortedJobs);
    previousJobsRef.current = sortedJobs;

    const latestCharacter = sortedJobs.find((job) => job.type === "generate-character-sheet");
    const hasSucceededCharacterJob = sortedJobs.some(
      (job) => job.type === "generate-character-sheet" && job.status === "succeeded"
    );

    if (latestCharacter?.status === "queued" || latestCharacter?.status === "running") {
      onGenerationStateChange?.("generating");
    } else if (latestCharacter?.status === "failed") {
      onGenerationStateChange?.("failed");
    } else if (hasSucceededCharacterJob) {
      onGenerationStateChange?.("succeeded");
    }

    if ((hadActiveCharacterJob || !assetsReady) && hasSucceededCharacterJob) {
      onAssetsUpdated();
    }
  }, [assetsReady, onAssetsUpdated, onGenerationStateChange, project.id]);

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

  const createCharacterJob = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/generation-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          type: "generate-character-sheet",
          input: {
            projectId: project.id,
            characterType: characterDesign.characterType,
            style: `${characterDesign.artStyle} / 線の太さ: ${characterDesign.lineWeight}`,
            colorTheme: characterDesign.colorTheme,
            costumeAndProps: characterDesign.costumeAndProps,
            personality: `${characterDesign.description} ${characterDesign.personality}`,
            mustKeepFeatures: [
              characterDesign.mustKeepFeatures,
              referenceImages.length
                ? `参照画像: ${referenceImages
                    .map((image, index) => `${index + 1}. ${image.name} (${image.url})`)
                    .join(" / ")}。アップロード済み参照画像を優先して、顔・体型・色・衣装・小物を合わせる。`
                : "",
            ]
              .filter(Boolean)
              .join(" "),
            referenceImages,
            referenceImageName: primaryReferenceImage?.name,
            referenceImageUrl: primaryReferenceImage?.url,
            referenceImageMimeType: primaryReferenceImage?.mimeType,
            referenceImageSizeBytes: primaryReferenceImage?.sizeBytes,
          },
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `HTTP ${response.status}`);
      }

      await refreshJobs();
      onGenerationStateChange?.("generating");
      toast.success("キャラクターシート生成を開始しました");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "生成ジョブの作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden rounded-xl border-green-100 bg-white shadow-sm">
      <CardHeader className="border-b bg-gradient-to-r from-green-50 via-white to-white">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <WandSparkles className="line-green" aria-hidden="true" />
              キャラクターデザインを作る
            </CardTitle>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">
              ここではスタンプ数やセリフを決めません。キャラクターの見た目だけを固め、承認後にスタンプ制作へ進みます。
            </p>
          </div>
          <Badge
            className={
              isApproved
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }
            variant="outline"
          >
            {isApproved ? "キャラクター承認済み" : "キャラクター未承認"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-5 p-5">
        {activeJob || isProjectGenerating ? (
          <GenerationProgressNotice job={activeJob} />
        ) : latestCharacterJob?.status === "failed" ? (
          <GenerationFailedNotice job={latestCharacterJob} />
        ) : null}

        <div className="grid gap-2 text-sm font-black text-zinc-800">
          参照画像
          <div className="grid gap-3 rounded-lg border bg-white p-3 sm:grid-cols-[minmax(0,1fr)_210px]">
            <div>
              <p className="text-sm font-black text-zinc-800">
                {referenceImages.length ? `${referenceImages.length}/3枚を使用` : "未設定"}
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">
                顔、体型、色、衣装、小物は参照画像を優先します。足りない固定条件だけ下の「維持する特徴」に書きます。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-1">
              {referenceImages.length ? (
                referenceImages.map((image, index) => (
                  <div className="grid min-w-0 grid-cols-[48px_1fr] gap-2 rounded-lg border bg-zinc-50 p-2" key={image.url}>
                    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={`アップロード済み参照画像 ${index + 1}`}
                        className="size-full object-contain"
                        src={image.url}
                      />
                    </div>
                    <div className="min-w-0 self-center">
                      <p className="truncate text-xs font-black text-zinc-800">
                        {index + 1}. {image.name}
                      </p>
                      <p className="text-[11px] font-semibold text-muted-foreground">{image.mimeType}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-lg border bg-zinc-50">
                  <Upload className="size-7 text-muted-foreground" aria-hidden="true" />
                </div>
              )}
            </div>
          </div>
        </div>

        <label className="grid gap-2 text-sm font-black text-zinc-800">
          キャラクター概要
          <textarea
            className="min-h-24 rounded-xl border bg-white px-3 py-3 text-sm font-semibold leading-6 text-zinc-700 outline-none focus-visible:border-green-400 focus-visible:ring-4 focus-visible:ring-green-100"
            onChange={(event) => updateDesign({ description: event.target.value })}
            value={characterDesign.description}
          />
        </label>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <p className="text-sm font-black text-zinc-800">絵のタッチ</p>
            <ToggleGroup
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
              onValueChange={(value) => value && updateDesign({ artStyle: value })}
              type="single"
              value={characterDesign.artStyle}
            >
              {characterArtStyles.map((style) => (
                <ToggleGroupItem
                  className="h-auto min-h-32 flex-col items-stretch justify-start rounded-xl border bg-white p-2 text-left text-xs font-black data-[state=on]:border-[#06C755] data-[state=on]:bg-green-50 data-[state=on]:text-green-700 sm:text-sm"
                  key={style}
                  value={style}
                >
                  <ArtStyleReferencePreview className="aspect-[128/86] w-full" styleName={style} />
                  <span className="mt-2 block px-1">{style}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-black text-zinc-800">線の太さ</p>
            <ToggleGroup
              className="grid grid-cols-3 gap-3"
              onValueChange={(value) => value && updateDesign({ lineWeight: value })}
              type="single"
              value={characterDesign.lineWeight}
            >
              {lineWeightOptions.map((weight) => (
                <ToggleGroupItem
                  className="h-auto min-h-28 flex-col items-stretch justify-start rounded-xl border bg-white p-2 text-sm font-black data-[state=on]:border-[#06C755] data-[state=on]:bg-green-50 data-[state=on]:text-green-700"
                  key={weight}
                  value={weight}
                >
                  <LineWeightReferencePreview className="aspect-[128/64] w-full" weight={weight} />
                  <span className="mt-2 block text-center">{weight}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <label className="grid gap-2 text-sm font-black text-zinc-800">
          維持する特徴
          <textarea
            className="min-h-20 rounded-xl border bg-white px-3 py-3 text-sm font-semibold leading-6 text-zinc-700 outline-none focus-visible:border-green-400 focus-visible:ring-4 focus-visible:ring-green-100"
            onChange={(event) => updateDesign({ mustKeepFeatures: event.target.value })}
            value={characterDesign.mustKeepFeatures}
          />
        </label>

        <div className="grid gap-3 rounded-xl border bg-zinc-50 p-4 md:grid-cols-[1fr_180px_180px] md:items-center">
          <div>
            <p className="text-sm font-black text-zinc-900">生成と承認</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">
              生成結果は右側に表示されます。気になる点があれば条件を微修正して再生成し、問題がなければ承認してください。
            </p>
          </div>
          <Button
            className="h-auto min-h-11 rounded-xl px-4 py-2 text-sm font-black line-bg"
            disabled={Boolean(activeJob) || isSubmitting}
            onClick={createCharacterJob}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : (
              <ImagePlus data-icon="inline-start" />
            )}
            {assetsReady ? "この条件で再生成" : "シート生成"}
          </Button>
          <Button
            className="h-auto min-h-11 rounded-xl px-4 py-2 text-sm font-black"
            disabled={!assetsReady}
            onClick={onApprove}
            variant={isApproved ? "outline" : "default"}
          >
            <CheckCircle2 data-icon="inline-start" />
            {isApproved ? "承認済み" : assetsReady ? "このデザインで承認" : "生成後に承認"}
          </Button>
        </div>

        <JobList
          isProjectGenerating={isProjectGenerating}
          jobs={jobs}
          latestCharacterJob={latestCharacterJob}
        />
      </CardContent>
    </Card>
  );
}

function GenerationProgressNotice({ job }: { job?: GenerationJobView }) {
  return (
    <div className="overflow-hidden rounded-xl border border-green-200 bg-green-50">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[#06C755] shadow-xs">
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          </span>
          <div>
            <p className="text-base font-black text-green-900">
              キャラクターシートを生成中です
            </p>
            <p className="mt-1 text-sm font-semibold leading-6 text-green-900/75">
              {!job
                ? "生成ジョブの状態を確認しています。画面を開いたままでも自動で更新されます。"
                : job.status === "queued"
                  ? "生成待ちキューに入りました。workerが順番に処理します。"
                  : "画像生成を実行しています。完了するとプレビューへ自動反映されます。"}
            </p>
          </div>
        </div>
        <Badge className="w-fit border-green-300 bg-white text-green-700" variant="outline">
          {job ? statusLabels[job.status] : "生成準備中"}
        </Badge>
      </div>
      <div className="h-1.5 overflow-hidden bg-green-100">
        <div className="h-full w-1/2 animate-pulse rounded-r-full bg-[#06C755]" />
      </div>
    </div>
  );
}

function GenerationFailedNotice({ job }: { job: GenerationJobView }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
        <div>
          <p className="text-base font-black text-amber-900">キャラクターシート生成に失敗しました</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-amber-900/75">
            {job.errorMessage ?? "条件を調整して、もう一度シート生成を実行してください。"}
          </p>
        </div>
      </div>
    </div>
  );
}

function JobList({
  isProjectGenerating,
  jobs,
  latestCharacterJob,
}: {
  isProjectGenerating: boolean;
  jobs: GenerationJobView[];
  latestCharacterJob?: GenerationJobView;
}) {
  if (!jobs.length) {
    return (
      <p className="rounded-lg border border-dashed bg-white p-3 text-sm font-semibold leading-6 text-muted-foreground">
        {isProjectGenerating
          ? "生成ジョブを確認中です。少し待つと待機中または生成中の状態に更新されます。"
          : "まだ生成ジョブはありません。条件を整えて「シート生成」から開始できます。"}
      </p>
    );
  }

  return (
    <div className="rounded-xl border bg-zinc-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-black text-zinc-800">キャラクター生成ジョブ</p>
        {latestCharacterJob ? (
          <p className="text-xs font-semibold text-muted-foreground">
            最終更新 {formatJobTime(latestCharacterJob.updatedAt)}
          </p>
        ) : null}
      </div>
      <div className="mt-3 grid gap-2">
        {jobs
          .filter((job) => job.type === "generate-character-sheet")
          .slice(0, 3)
          .map((job) => (
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
                <span>キャラクターシート生成</span>
              </div>
              <span className="rounded-full border bg-zinc-50 px-2 py-1 text-xs font-black">
                {statusLabels[job.status]}
              </span>
              {job.errorMessage ? (
                <p className="w-full text-xs font-semibold text-amber-700">{job.errorMessage}</p>
              ) : null}
            </div>
          ))}
      </div>
    </div>
  );
}

function formatJobTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
