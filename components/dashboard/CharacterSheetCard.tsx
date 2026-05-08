"use client";

import { ChangeEvent, useState } from "react";
import { ImageUp, Info, Loader2, WandSparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  demoGeneratedAssetUrls,
  getGeneratedProjectAssetUrls,
} from "@/lib/generated-assets";

type CharacterSheetCardProps = {
  projectId?: string;
  assetVersion?: string | number | null;
  assetsReady?: boolean;
  onFocusEditor?: () => void;
  onFeedbackSubmit?: (feedback: string) => Promise<void> | void;
  onManualUpload?: (file: File) => Promise<void> | void;
};

export function CharacterSheetCard({
  projectId,
  assetVersion,
  assetsReady = true,
  onFocusEditor,
  onFeedbackSubmit,
  onManualUpload,
}: CharacterSheetCardProps) {
  const [feedback, setFeedback] = useState("");
  const [isApplyingFeedback, setIsApplyingFeedback] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const assets = getGeneratedProjectAssetUrls(projectId);
  const versionSuffix = assetVersion ? `?v=${encodeURIComponent(String(assetVersion))}` : "";

  const submitFeedback = async () => {
    const trimmedFeedback = feedback.trim();
    if (!trimmedFeedback || !onFeedbackSubmit) {
      return;
    }

    setIsApplyingFeedback(true);
    try {
      await onFeedbackSubmit(trimmedFeedback);
      setFeedback("");
    } finally {
      setIsApplyingFeedback(false);
    }
  };

  const handleManualUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onManualUpload) {
      return;
    }

    setIsUploading(true);
    try {
      await onManualUpload(file);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-xl font-black">作成結果</CardTitle>
          <Tooltip>
            <TooltipTrigger className="text-muted-foreground">
              <Info aria-hidden="true" />
              <span className="sr-only">キャラクターシートの説明</span>
            </TooltipTrigger>
            <TooltipContent>同じキャラクターを再現するための参照画像です。</TooltipContent>
          </Tooltip>
        </div>
        <p className="text-sm font-semibold leading-6 text-muted-foreground">
          生成された1枚のキャラクターシートを確認します。気になる点があれば入力条件を微修正して、もう一度生成できます。
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="overflow-hidden rounded-xl border bg-white p-3">
          {assetsReady ? (
            <GeneratedAssetImage
              alt="生成されたキャラクターシート"
              className="aspect-square w-full"
              fallbackSrc={demoGeneratedAssetUrls.characterSheet}
              imageClassName="object-contain"
              src={`${assets.characterSheet}${versionSuffix}`}
            />
          ) : (
            <div className="flex aspect-square w-full flex-col items-center justify-center rounded-lg bg-green-50 text-center">
              <p className="text-base font-black text-green-800">キャラクターシート未生成</p>
              <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-green-900/75">
                左の入力内容からキャラクターシートを生成すると、ここに参照画像が表示されます。
              </p>
            </div>
          )}
        </div>
        <div className="rounded-xl border bg-zinc-50 p-4">
          <p className="text-sm font-black text-zinc-900">
            {assetsReady ? "生成済みのキャラクターシートです" : "まだ生成結果はありません"}
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">
            承認前なら、概要・絵のタッチ・線の太さ・維持する特徴を調整して再生成できます。
          </p>
          {onFocusEditor ? (
            <button
              className="mt-3 inline-flex h-10 items-center justify-center rounded-lg border bg-white px-4 text-sm font-black text-zinc-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
              onClick={onFocusEditor}
              type="button"
            >
              条件を微修正する
            </button>
          ) : null}
        </div>
        <div className="grid gap-3 rounded-xl border bg-white p-4">
          <div>
            <p className="text-sm font-black text-zinc-900">生成結果を直す</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">
              AIに修正点を渡して再生成するか、人間が編集したPNGを手動で差し替えられます。
            </p>
          </div>
          <textarea
            className="min-h-24 rounded-xl border bg-white px-3 py-3 text-sm font-semibold leading-6 text-zinc-700 outline-none focus-visible:border-green-400 focus-visible:ring-4 focus-visible:ring-green-100"
            disabled={!assetsReady || isApplyingFeedback}
            onChange={(event) => setFeedback(event.target.value)}
            placeholder="例: もっと手描き風に。線を少し揺らして、帽子の花飾りは残す。"
            value={feedback}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#06C755] px-4 py-2 text-sm font-black text-white transition hover:bg-[#00B900] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
              disabled={!assetsReady || !feedback.trim() || isApplyingFeedback}
              onClick={submitFeedback}
              type="button"
            >
              {isApplyingFeedback ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <WandSparkles className="size-4" aria-hidden="true" />
              )}
              AIに反映
            </button>
            <label
              className={
                assetsReady
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
                disabled={!assetsReady || isUploading}
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
