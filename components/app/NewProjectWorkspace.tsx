"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileArchive,
  Grid3X3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { AppFrame } from "@/components/app/AppFrame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { phraseTemplateTexts } from "@/lib/constants";
import { createProjectId, saveProjectDraft } from "@/lib/project-drafts";
import { templateSets } from "@/lib/operational-data";
import type { ProjectCreationDraft, StickerCount, TextMode } from "@/lib/types";

const stickerCounts: StickerCount[] = [8, 16, 24, 32, 40];

const textModeOptions: Array<{
  value: TextMode;
  label: string;
  description: string;
}> = [
  {
    value: "ai",
    label: "AIに書かせる",
    description: "イラストと文字をまとめて生成",
  },
  {
    value: "overlay",
    label: "あと乗せ",
    description: "生成後に読みやすい日本語文字を合成",
  },
  {
    value: "hybrid",
    label: "ハイブリッド",
    description: "AI文字をベースに必要箇所だけ修正",
  },
];

const textareaClassName =
  "min-h-28 rounded-md border border-input bg-white px-3 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function uniquePhrases(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function NewProjectWorkspace() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("魔法うさぎスタンプ Vol.1");
  const [studioName, setStudioName] = useState("Magic Rabbit Studio");
  const [characterType, setCharacterType] = useState("白うさぎ");
  const [style, setStyle] = useState("かわいいマジシャン風");
  const [colorTheme, setColorTheme] = useState("白、黒、緑、ピンク、オレンジ");
  const [costumeAndProps, setCostumeAndProps] = useState("シルクハット、マント、星のステッキ");
  const [personality, setPersonality] = useState("明るく丁寧。日常会話で使いやすい表情が多い。");
  const [usageScene, setUsageScene] = useState("友だち、家族、仕事連絡で使いやすいあいさつ・感謝・確認中心");
  const [stickerCount, setStickerCount] = useState<StickerCount>(24);
  const [textMode, setTextMode] = useState<TextMode>("hybrid");
  const [templateId, setTemplateId] = useState("daily-24");
  const [titleJa, setTitleJa] = useState("魔法うさぎスタンプ Vol.1");
  const [titleEn, setTitleEn] = useState("Magic Rabbit Stickers Vol.1");
  const [descriptionJa, setDescriptionJa] = useState(
    "白うさぎのマジシャンが、毎日の会話で使いやすい気持ちを届けるスタンプセットです。"
  );
  const [descriptionEn, setDescriptionEn] = useState("A friendly magic rabbit sticker set for daily chats.");
  const [creatorName, setCreatorName] = useState("Magic Rabbit Studio");
  const [copyright, setCopyright] = useState("© Magic Rabbit Studio");
  const [containsAiGeneratedContent, setContainsAiGeneratedContent] = useState(true);

  const selectedTemplate = useMemo(
    () => templateSets.find((template) => template.id === templateId) ?? templateSets[0],
    [templateId]
  );

  const phrases = useMemo(
    () => uniquePhrases([...(selectedTemplate?.phrases ?? []), ...phraseTemplateTexts]).slice(0, stickerCount),
    [selectedTemplate, stickerCount]
  );

  const validations = useMemo(
    () => [
      { label: "キャラクターシート名", valid: projectName.trim().length >= 2 },
      { label: "キャラクター種別", valid: characterType.trim().length >= 2 },
      { label: "用途・利用シーン", valid: usageScene.trim().length >= 10 },
      { label: "申請タイトル", valid: titleJa.trim().length >= 2 },
      { label: "説明文", valid: descriptionJa.trim().length >= 20 },
      { label: "クリエイター名", valid: creatorName.trim().length >= 2 },
      { label: "コピーライト", valid: copyright.trim().length >= 2 },
    ],
    [characterType, copyright, creatorName, descriptionJa, projectName, titleJa, usageScene]
  );

  const canSubmit = validations.every((item) => item.valid);

  const handleTemplateSelect = (id: string, count: StickerCount) => {
    setTemplateId(id);
    setStickerCount(count);
  };

  const createProject = () => {
    if (!canSubmit) {
      toast.error("未入力または短すぎる項目があります。赤いチェック項目を確認してください。");
      return;
    }

    const now = new Date().toISOString();
    const draft: ProjectCreationDraft = {
      id: createProjectId(projectName),
      name: projectName.trim(),
      studioName: studioName.trim(),
      status: "draft",
      stickerCount,
      textMode,
      characterType: characterType.trim(),
      style: style.trim(),
      colorTheme: colorTheme.trim(),
      costumeAndProps: costumeAndProps.trim(),
      personality: personality.trim(),
      usageScene: usageScene.trim(),
      title: {
        ja: titleJa.trim(),
        en: titleEn.trim() || undefined,
      },
      description: {
        ja: descriptionJa.trim(),
        en: descriptionEn.trim() || undefined,
      },
      creatorName: creatorName.trim(),
      copyright: copyright.trim(),
      containsAiGeneratedContent,
      phrases,
      createdAt: now,
      updatedAt: now,
    };

    saveProjectDraft(draft);
    toast.success("キャラクターシートを作成しました");
    router.push(`/app/projects/${draft.id}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createProject();
  };

  return (
    <AppFrame
      active="キャラクターシート"
      action={
        <Button asChild variant="outline">
          <Link href="/app/projects">一覧へ戻る</Link>
        </Button>
      }
      description="まずキャラクターシートを作成し、その同じキャラから複数のスタンプセットへ展開します。"
      title="キャラクターシート作成"
    >
      <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]" onSubmit={handleSubmit}>
        <section className="flex min-w-0 flex-col gap-6">
          <Card className="rounded-xl bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-green-100 text-green-700" variant="secondary">
                  1
                </Badge>
                <CardTitle className="text-xl font-black">企画入力</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
                キャラクターシート名
                <Input
                  className="bg-white"
                  onChange={(event) => {
                    setProjectName(event.target.value);
                    setTitleJa(event.target.value);
                  }}
                  value={projectName}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
                制作名義
                <Input
                  className="bg-white"
                  onChange={(event) => {
                    setStudioName(event.target.value);
                    setCreatorName(event.target.value);
                    setCopyright(`© ${event.target.value}`);
                  }}
                  value={studioName}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
                キャラクター種別
                <Input className="bg-white" onChange={(event) => setCharacterType(event.target.value)} value={characterType} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
                テイスト
                <Input className="bg-white" onChange={(event) => setStyle(event.target.value)} value={style} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
                色味
                <Input className="bg-white" onChange={(event) => setColorTheme(event.target.value)} value={colorTheme} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
                衣装・小物
                <Input
                  className="bg-white"
                  onChange={(event) => setCostumeAndProps(event.target.value)}
                  value={costumeAndProps}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700 md:col-span-2">
                性格・雰囲気
                <textarea
                  className={textareaClassName}
                  onChange={(event) => setPersonality(event.target.value)}
                  value={personality}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700 md:col-span-2">
                用途・利用シーン
                <textarea
                  className={textareaClassName}
                  onChange={(event) => setUsageScene(event.target.value)}
                  value={usageScene}
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
                <CardTitle className="text-xl font-black">スタンプ構成</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <p className="text-sm font-black text-zinc-800">スタンプ数</p>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {stickerCounts.map((count) => (
                    <Button
                      className={stickerCount === count ? "line-bg" : "bg-white"}
                      key={count}
                      onClick={() => setStickerCount(count)}
                      type="button"
                      variant={stickerCount === count ? "default" : "outline"}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-black text-zinc-800">文字モード</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {textModeOptions.map((option) => (
                    <button
                      className={
                        textMode === option.value
                          ? "rounded-xl border border-green-300 bg-green-50 p-4 text-left shadow-sm"
                          : "rounded-xl border bg-white p-4 text-left transition hover:border-green-200 hover:bg-green-50/40"
                      }
                      key={option.value}
                      onClick={() => setTextMode(option.value)}
                      type="button"
                    >
                      <span className="text-sm font-black text-zinc-950">{option.label}</span>
                      <span className="mt-2 block text-xs font-semibold leading-5 text-muted-foreground">
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-black text-zinc-800">セリフテンプレート</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {templateSets.map((template) => (
                    <button
                      className={
                        templateId === template.id
                          ? "rounded-xl border border-green-300 bg-green-50 p-4 text-left"
                          : "rounded-xl border bg-zinc-50 p-4 text-left transition hover:border-green-200 hover:bg-green-50/40"
                      }
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id, template.stickerCount)}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-zinc-950">{template.name}</span>
                        <Badge variant="secondary">{template.stickerCount}個</Badge>
                      </div>
                      <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-green-100 text-green-700" variant="secondary">
                  3
                </Badge>
                <CardTitle className="text-xl font-black">Creators Market向け申請情報</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
                タイトル（日本語）
                <Input className="bg-white" onChange={(event) => setTitleJa(event.target.value)} value={titleJa} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
                タイトル（英語・任意）
                <Input className="bg-white" onChange={(event) => setTitleEn(event.target.value)} value={titleEn} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700 md:col-span-2">
                説明文（日本語）
                <textarea
                  className={textareaClassName}
                  onChange={(event) => setDescriptionJa(event.target.value)}
                  value={descriptionJa}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700 md:col-span-2">
                説明文（英語・任意）
                <textarea
                  className={textareaClassName}
                  onChange={(event) => setDescriptionEn(event.target.value)}
                  value={descriptionEn}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
                クリエイター名
                <Input className="bg-white" onChange={(event) => setCreatorName(event.target.value)} value={creatorName} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
                コピーライト
                <Input className="bg-white" onChange={(event) => setCopyright(event.target.value)} value={copyright} />
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900 md:col-span-2">
                <input
                  checked={containsAiGeneratedContent}
                  className="mt-1 size-4 accent-green-600"
                  onChange={(event) => setContainsAiGeneratedContent(event.target.checked)}
                  type="checkbox"
                />
                <span>
                  AI生成またはAI補助で作られたコンテンツを含みます。販売画面でAI生成コンテンツに関する表記が表示される可能性があります。
                </span>
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
                <p className="mt-2 text-lg font-black text-zinc-950">{projectName || "未入力"}</p>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">{studioName || "制作名義未入力"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border bg-white p-4">
                  <Grid3X3 className="line-green" aria-hidden="true" />
                  <p className="mt-2 text-2xl font-black">{stickerCount}個</p>
                  <p className="text-xs font-bold text-muted-foreground">静止画スタンプ</p>
                </div>
                <div className="rounded-xl border bg-white p-4">
                  <FileArchive className="line-green" aria-hidden="true" />
                  <p className="mt-2 text-2xl font-black">ZIP</p>
                  <p className="text-xs font-bold text-muted-foreground">Creators Market用</p>
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm font-black text-zinc-800">セリフプレビュー</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {phrases.slice(0, 12).map((phrase) => (
                    <span className="rounded-full border bg-zinc-50 px-3 py-1 text-xs font-bold" key={phrase}>
                      {phrase}
                    </span>
                  ))}
                  {phrases.length > 12 ? (
                    <span className="rounded-full border bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                      +{phrases.length - 12}
                    </span>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <ShieldCheck className="text-emerald-600" aria-hidden="true" />
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
              <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold leading-5 text-amber-900">
                本サービスはLINE公式サービスではありません。審査通過を保証するものではありません。
              </div>
              <Button
                className="mt-2 h-12 line-bg text-base font-black"
                disabled={!canSubmit}
                onClick={createProject}
                type="button"
              >
                キャラクターシートを作成
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardContent>
          </Card>
        </aside>
      </form>
    </AppFrame>
  );
}
