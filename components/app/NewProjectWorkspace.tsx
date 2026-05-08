"use client";

/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Palette,
  Sparkles,
  Upload,
  WandSparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AppFrame } from "@/components/app/AppFrame";
import { ProductionFlow } from "@/components/app/ProductionFlow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArtStyleReferencePreview, LineWeightReferencePreview } from "@/components/ui/StyleReferencePreview";
import { characterArtStyles, lineWeightOptions, phraseTemplateTexts } from "@/lib/constants";
import { createProjectId, saveProjectDraft } from "@/lib/project-drafts";
import type { ProjectCreationDraft, ReferenceImageAsset } from "@/lib/types";

const textareaClassName =
  "min-h-28 rounded-md border border-input bg-white px-3 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

type ReferenceImageUploadResponse = {
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  error?: string;
};

const maxReferenceImageBytes = 5 * 1024 * 1024;
const maxReferenceImageCount = 3;

function formatFileSize(bytes?: number) {
  if (!bytes) {
    return "";
  }

  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

export function NewProjectWorkspace() {
  const router = useRouter();
  const [sheetName, setSheetName] = useState("");
  const [referenceImages, setReferenceImages] = useState<ReferenceImageAsset[]>([]);
  const [referenceImageError, setReferenceImageError] = useState("");
  const [isUploadingReferenceImage, setIsUploadingReferenceImage] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [characterDescription, setCharacterDescription] = useState("");
  const [artStyle, setArtStyle] = useState("");
  const [lineWeight, setLineWeight] = useState("");
  const [mustKeepFeatures, setMustKeepFeatures] = useState("");

  const validations = useMemo(
    () => [
      { label: "キャラクターシート名", valid: sheetName.trim().length >= 2 },
      { label: "キャラクター概要", valid: characterDescription.trim().length >= 12 },
      { label: "絵のタッチ", valid: artStyle.trim().length >= 2 },
      { label: "線の太さ", valid: lineWeight.trim().length >= 1 },
      { label: "維持する特徴", valid: mustKeepFeatures.trim().length >= 10 },
    ],
    [artStyle, characterDescription, lineWeight, mustKeepFeatures, sheetName]
  );

  const canSubmit = validations.every((item) => item.valid) && !isUploadingReferenceImage && !isCreatingSheet;
  const primaryReferenceImage = referenceImages[0];
  const remainingReferenceImageSlots = maxReferenceImageCount - referenceImages.length;

  const handleReferenceImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    setReferenceImageError("");

    if (files.length > remainingReferenceImageSlots) {
      const message = `参照画像は最大${maxReferenceImageCount}枚までです。あと${remainingReferenceImageSlots}枚追加できます。`;
      setReferenceImageError(message);
      toast.error(message);
      event.target.value = "";
      return;
    }

    const invalidTypeFile = files.find((file) => !["image/png", "image/jpeg", "image/webp"].includes(file.type));
    if (invalidTypeFile) {
      const message = "PNG、JPEG、WebPのいずれかをアップロードしてください。";
      setReferenceImageError(message);
      toast.error(message);
      event.target.value = "";
      return;
    }

    const oversizedFile = files.find((file) => file.size > maxReferenceImageBytes);
    if (oversizedFile) {
      const message = "参照画像は5MB以内にしてください。";
      setReferenceImageError(message);
      toast.error(message);
      event.target.value = "";
      return;
    }

    setIsUploadingReferenceImage(true);

    try {
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/reference-images", {
            method: "POST",
            body: formData,
          });
          const result = (await response.json()) as ReferenceImageUploadResponse;

          if (!response.ok) {
            throw new Error(result.error ?? "参照画像のアップロードに失敗しました。");
          }

          return {
            name: result.name,
            url: result.url,
            mimeType: result.mimeType,
            sizeBytes: result.sizeBytes,
          } satisfies ReferenceImageAsset;
        })
      );

      setReferenceImages((current) => [...current, ...uploadedImages].slice(0, maxReferenceImageCount));
      toast.success(`参照画像を${uploadedImages.length}枚アップロードしました`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "参照画像のアップロードに失敗しました。";
      setReferenceImageError(message);
      toast.error(message);
    } finally {
      setIsUploadingReferenceImage(false);
      event.target.value = "";
    }
  };

  const removeReferenceImage = (url: string) => {
    setReferenceImages((current) => current.filter((image) => image.url !== url));
    setReferenceImageError("");
  };

  const createCharacterSheet = async () => {
    if (!canSubmit) {
      toast.error("未入力または短すぎる項目があります。赤いチェック項目を確認してください。");
      return;
    }

    setIsCreatingSheet(true);

    const now = new Date().toISOString();
    const trimmedSheetName = sheetName.trim();
    const trimmedCharacterDescription = characterDescription.trim();
    const trimmedMustKeepFeatures = mustKeepFeatures.trim();
    const internalCreatorName = "Creator";
    const characterLabel = trimmedSheetName.replace(/キャラクターシート$/, "").trim() || trimmedSheetName;
    const sourcePolicy = referenceImages.length
      ? "参照画像、キャラクター概要、維持する特徴に準拠"
      : "キャラクター概要と維持する特徴に準拠";
    const draft: ProjectCreationDraft = {
      id: createProjectId(trimmedSheetName),
      name: trimmedSheetName,
      studioName: internalCreatorName,
      status: "generating",
      stickerCount: 24,
      textMode: "hybrid",
      characterType: characterLabel,
      referenceImages,
      referenceImageName: primaryReferenceImage?.name,
      referenceImageUrl: primaryReferenceImage?.url,
      referenceImageMimeType: primaryReferenceImage?.mimeType,
      referenceImageSizeBytes: primaryReferenceImage?.sizeBytes,
      characterDescription: trimmedCharacterDescription,
      mustKeepFeatures: trimmedMustKeepFeatures,
      style: `${artStyle.trim()} / 線の太さ: ${lineWeight}`,
      colorTheme: sourcePolicy,
      costumeAndProps: sourcePolicy,
      personality: trimmedCharacterDescription,
      usageScene: "キャラクターシート作成から開始。スタンプ内容は専用のスタンプ作成画面で編集する。",
      title: {
        ja: trimmedSheetName,
      },
      description: {
        ja: `${trimmedSheetName}のキャラクターシートです。`,
      },
      creatorName: internalCreatorName,
      copyright: `© ${internalCreatorName}`,
      containsAiGeneratedContent: true,
      phrases: phraseTemplateTexts,
      createdAt: now,
      updatedAt: now,
    };

    try {
      saveProjectDraft(draft);

      const response = await fetch("/api/generation-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: draft.id,
          type: "generate-character-sheet",
          input: {
            projectId: draft.id,
            characterType: draft.characterType,
            style: draft.style,
            colorTheme: draft.colorTheme,
            costumeAndProps: draft.costumeAndProps,
            personality: draft.personality,
            mustKeepFeatures: [
              draft.mustKeepFeatures,
              referenceImages.length
                ? `参照画像: ${referenceImages
                    .map((image, index) => `${index + 1}. ${image.name} (${image.url})`)
                    .join(" / ")}。アップロード済み参照画像を優先して、顔・体型・色・衣装・小物を合わせる。`
                : "参照画像なし。キャラクター概要、絵のタッチ、線の太さ、維持する特徴だけで一貫したキャラクターシートを作る。",
            ].join(" "),
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

      toast.success("キャラクターシート生成を開始しました");
      router.push(`/app/projects/${encodeURIComponent(draft.id)}`);
    } catch (error) {
      saveProjectDraft({
        ...draft,
        status: "draft",
        updatedAt: new Date().toISOString(),
      });
      toast.error(error instanceof Error ? error.message : "生成ジョブの開始に失敗しました");
      setIsCreatingSheet(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createCharacterSheet();
  };

  return (
    <AppFrame
      active="キャラクターシート"
      action={
        <Button asChild variant="outline">
          <Link href="/app/projects">一覧へ戻る</Link>
        </Button>
      }
      description="ここではキャラクターの見た目だけを作ります。スタンプ数やセリフはキャラクター承認後、スタンプ作成画面で設定します。"
      title="キャラクターシート作成"
    >
      <div className="mb-6">
        <ProductionFlow variant="new-character" />
      </div>
      <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleSubmit}>
        <section className="flex min-w-0 flex-col gap-6">
          <Card className="rounded-xl bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-green-100 text-green-700" variant="secondary">
                  1
                </Badge>
                <CardTitle className="text-xl font-black">キャラクターの材料</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700 md:col-span-2">
                キャラクターシート名
                <Input
                  className="bg-white"
                  onChange={(event) => setSheetName(event.target.value)}
                  placeholder="例: 魔法うさぎ"
                  value={sheetName}
                />
              </label>
              <div className="flex flex-col gap-2 text-sm font-bold text-zinc-700 md:col-span-2">
                参照画像
                <div className="rounded-xl border border-dashed bg-green-50/35 p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#06c755] shadow-xs">
                        <Upload className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-zinc-900">
                          {referenceImages.length
                            ? `参照画像 ${referenceImages.length}/${maxReferenceImageCount}枚`
                            : "キャラクターの参考画像をアップロード（任意）"}
                        </p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">
                          画像なしでも作成できます。使う場合はPNG / JPEG / WebP、1枚5MB以内、最大3枚まで。
                        </p>
                        {referenceImageError ? (
                          <p className="mt-2 text-xs font-bold text-amber-700">{referenceImageError}</p>
                        ) : null}
                      </div>
                    </div>
                    <input
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      id="reference-image-upload"
                      multiple
                      onChange={handleReferenceImageChange}
                      type="file"
                    />
                    <label
                      aria-disabled={remainingReferenceImageSlots <= 0 || isUploadingReferenceImage}
                      className={
                        remainingReferenceImageSlots <= 0
                          ? "inline-flex h-10 shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-md bg-zinc-200 px-4 text-sm font-black text-zinc-500"
                          : "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#06c755] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#05b64d]"
                      }
                      htmlFor={remainingReferenceImageSlots <= 0 ? undefined : "reference-image-upload"}
                    >
                      {isUploadingReferenceImage ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Upload className="size-4" aria-hidden="true" />
                      )}
                      {referenceImages.length ? "画像を追加" : "画像を選択"}
                    </label>
                  </div>
                  {referenceImages.length ? (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {referenceImages.map((image, index) => (
                        <div
                          className="relative grid w-44 shrink-0 grid-cols-[56px_1fr] gap-2 rounded-lg border bg-white p-2"
                          key={image.url}
                        >
                          <div className="flex size-14 items-center justify-center overflow-hidden rounded-md bg-zinc-50">
                            <img
                              alt={`アップロード済み参照画像 ${index + 1}`}
                              className="size-full object-contain"
                              src={image.url}
                            />
                          </div>
                          <div className="min-w-0 pr-5">
                            <p className="truncate text-xs font-black text-zinc-800">
                              {index + 1}. {image.name}
                            </p>
                            <p className="mt-1 text-[11px] font-bold leading-4 text-muted-foreground">
                              {image.mimeType}
                              <br />
                              {formatFileSize(image.sizeBytes)}
                            </p>
                          </div>
                          <button
                            aria-label={`${image.name}を削除`}
                            className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full border bg-white text-zinc-600 shadow-sm transition hover:border-red-200 hover:text-red-600"
                            onClick={() => removeReferenceImage(image.url)}
                            type="button"
                          >
                            <X className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700 md:col-span-2">
                キャラクター概要
                <textarea
                  className={textareaClassName}
                  onChange={(event) => setCharacterDescription(event.target.value)}
                  placeholder="例: 白いうさぎのマジシャン。明るく丁寧で、少しお茶目。日常会話で使いやすい雰囲気。"
                  value={characterDescription}
                />
              </label>
            </CardContent>
          </Card>

          <Card className="rounded-xl bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-green-100 text-green-700" variant="secondary">
                  2
                </Badge>
                <CardTitle className="text-xl font-black">生成スタイルと固定条件</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <p className="text-sm font-black text-zinc-800">絵のタッチ</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {characterArtStyles.map((styleOption) => (
                    <button
                      className={
                        artStyle === styleOption
                          ? "rounded-xl border border-green-300 bg-green-50 p-2 text-left text-sm font-black text-green-700 shadow-sm"
                          : "rounded-xl border bg-white p-2 text-left text-sm font-bold text-zinc-700 transition hover:border-green-200 hover:bg-green-50/40"
                      }
                      key={styleOption}
                      onClick={() => setArtStyle(styleOption)}
                      type="button"
                    >
                      <ArtStyleReferencePreview className="aspect-[128/86] w-full" styleName={styleOption} />
                      <span className="mt-2 block px-1">{styleOption}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-black text-zinc-800">線の太さ</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {lineWeightOptions.map((weight) => (
                    <button
                      className={
                        lineWeight === weight
                          ? "rounded-xl border border-green-300 bg-green-50 p-2 text-sm font-black text-green-700 shadow-sm"
                          : "rounded-xl border bg-white p-2 text-sm font-bold text-zinc-700 transition hover:border-green-200 hover:bg-green-50/40"
                      }
                      key={weight}
                      onClick={() => setLineWeight(weight)}
                      type="button"
                    >
                      <LineWeightReferencePreview className="aspect-[128/64] w-full" weight={weight} />
                      <span className="mt-2 block">{weight}</span>
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
                維持する特徴
                <textarea
                  className={textareaClassName}
                  onChange={(event) => setMustKeepFeatures(event.target.value)}
                  placeholder="例: ピンクの耳、黒い帽子、オレンジの花飾り、丸い黒目は必ず維持。別衣装や別キャラクターに見える変更はしない。"
                  value={mustKeepFeatures}
                />
              </label>
            </CardContent>
          </Card>
        </section>

        <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-28 xl:self-start">
          <Card className="rounded-xl border-green-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <Sparkles className="line-green" aria-hidden="true" />
                作成内容
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-xl border bg-zinc-50 p-4">
                <p className="text-xs font-black text-muted-foreground">キャラクターシート</p>
                <p className="mt-2 text-lg font-black text-zinc-950">{sheetName || "未入力"}</p>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-xs font-black text-muted-foreground">参照画像</p>
                {referenceImages.length ? (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {referenceImages.map((image, index) => (
                      <div className="min-w-0" key={image.url}>
                        <img
                          alt={`参照画像サムネイル ${index + 1}`}
                          className="aspect-square w-full rounded-lg border object-cover"
                          src={image.url}
                        />
                        <p className="mt-1 truncate text-[11px] font-black text-zinc-950">{image.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm font-bold text-zinc-500">任意・未アップロード</p>
                )}
              </div>
              <div className="rounded-xl border bg-white p-4">
                <Palette className="line-green" aria-hidden="true" />
                <p className="mt-2 text-sm font-black text-zinc-950">{artStyle || "絵のタッチ未選択"}</p>
                <p className="mt-1 text-xs font-bold text-muted-foreground">
                  線の太さ: {lineWeight || "未選択"}
                </p>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm font-black text-zinc-800">次の流れ</p>
                <ol className="mt-3 space-y-2 text-sm font-semibold leading-6 text-muted-foreground">
                  <li>1. キャラクターシートを生成</li>
                  <li>2. 見た目を確認して承認</li>
                  <li>3. 一覧のスタンプ作成ボタンからセリフと動きを設定</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <WandSparkles className="text-emerald-600" aria-hidden="true" />
                入力チェック
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {validations.map((item) => (
                <div className="flex items-center gap-2 text-sm font-bold" key={item.label}>
                  {item.valid ? (
                    <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="size-4 text-amber-600" aria-hidden="true" />
                  )}
                  <span className={item.valid ? "text-zinc-700" : "text-amber-700"}>{item.label}</span>
                </div>
              ))}
              <div className="mt-2 rounded-xl border border-green-200 bg-green-50 p-4 text-xs font-semibold leading-5 text-green-900">
                この画面ではスタンプ数やセリフは設定しません。
              </div>
              <Button
                className="mt-2 h-12 line-bg text-base font-black"
                disabled={!canSubmit}
                onClick={createCharacterSheet}
                type="button"
              >
                {isCreatingSheet ? (
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                ) : null}
                {isCreatingSheet ? "生成を開始しています" : "作成して生成開始"}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardContent>
          </Card>
        </aside>
      </form>
    </AppFrame>
  );
}
