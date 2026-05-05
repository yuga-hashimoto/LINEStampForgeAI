import { Copy, Download, ExternalLink, FileJson, PackageCheck, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { Input } from "@/components/ui/input";
import { exportZip } from "@/lib/api-stubs";
import { demoGeneratedAssetUrls, getGeneratedProjectAssetUrls } from "@/lib/generated-assets";
import type {
  CheckItem,
  Project,
  StickerPhrase,
  SubmissionPackTokenResponse,
} from "@/lib/types";

type ExportPanelProps = {
  project: Project;
  phrases: StickerPhrase[];
  checks: CheckItem[];
};

export function ExportPanel({ project, phrases, checks }: ExportPanelProps) {
  const assets = getGeneratedProjectAssetUrls(project.id);
  const [titleJa, setTitleJa] = useState(project.name);
  const [titleEn, setTitleEn] = useState("Magic Rabbit Stickers Vol.1");
  const [descriptionJa, setDescriptionJa] = useState(
    "白うさぎマジシャンの日常会話向けLINEスタンプです。"
  );
  const [descriptionEn, setDescriptionEn] = useState(
    "Everyday static stickers featuring a white rabbit magician."
  );
  const [creatorName, setCreatorName] = useState(project.studioName);
  const [copyright, setCopyright] = useState(
    `© ${new Date().getFullYear()} ${project.studioName}`
  );
  const [containsAiGeneratedContent, setContainsAiGeneratedContent] = useState(true);
  const [submissionPack, setSubmissionPack] =
    useState<SubmissionPackTokenResponse | null>(null);
  const [isCreatingPack, setIsCreatingPack] = useState(false);

  const passedCheckCount = useMemo(
    () => checks.filter((check) => check.status === "pass").length,
    [checks]
  );

  const handleExport = async () => {
    try {
      toast.info("生成済みPNGをZIPにまとめています");
      const result = await exportZip({ project, phrases, checks });
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(`PNG ZIPを生成しました（${result.sizeMb}MB）`);
    } catch (error) {
      toast.error("ZIP書き出しに失敗しました。先にスタンプ生成を実行してください。");
      console.error(error);
    }
  };

  const handleCreateSubmissionPack = async () => {
    setIsCreatingPack(true);

    try {
      const response = await fetch("/api/submission-packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          checks,
          title: { ja: titleJa, en: titleEn },
          description: { ja: descriptionJa, en: descriptionEn },
          creatorName,
          copyright,
          containsAiGeneratedContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = (await response.json()) as SubmissionPackTokenResponse;
      setSubmissionPack(result);
      toast.success("申請パックURLを発行しました");
    } catch (error) {
      toast.error("申請パックURLの発行に失敗しました");
      console.error(error);
    } finally {
      setIsCreatingPack(false);
    }
  };

  const handleCopyManifestUrl = async () => {
    if (!submissionPack) {
      return;
    }

    await navigator.clipboard.writeText(submissionPack.manifestUrl);
    toast.success("申請パックURLをコピーしました");
  };

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_1.5fr]">
      <Card className="min-w-0 rounded-xl bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-black">メイン画像（240×240px）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="checkerboard mx-auto flex aspect-square max-w-32 items-center justify-center rounded-xl border p-3">
            <GeneratedAssetImage
              alt="メイン画像用マスコット"
              className="size-full rounded-lg"
              fallbackSrc={demoGeneratedAssetUrls.main}
              src={assets.main}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0 rounded-xl bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-black">タブ画像（96×74px）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="checkerboard mx-auto flex aspect-[96/74] max-w-32 items-center justify-center rounded-xl border p-2">
            <GeneratedAssetImage
              alt="タブ画像用マスコット"
              className="size-full rounded-lg"
              fallbackSrc={demoGeneratedAssetUrls.tab}
              src={assets.tab}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0 rounded-xl bg-white shadow-sm">
        <CardContent className="flex h-full flex-col justify-center gap-4 p-5">
          <Button
            className="h-16 rounded-xl line-bg text-lg font-black shadow-lg shadow-green-500/20"
            onClick={handleExport}
          >
            <Download data-icon="inline-start" />
            ZIPを書き出す
          </Button>
          <p className="text-center text-sm font-semibold text-muted-foreground">
            ZIPサイズの目安：{project.zipSizeEstimateMb}MB
          </p>
        </CardContent>
      </Card>

      <Card className="min-w-0 rounded-xl border-green-100 bg-white shadow-sm md:col-span-3">
        <CardHeader className="gap-2 pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex min-w-0 flex-wrap items-center gap-2 text-base font-black">
                <PackageCheck className="size-5 text-[#06c755]" />
                Creators Market 出品アシスタント
              </CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                拡張機能に渡す申請用マニフェストと短期URLを発行します。ログイン、最終確認、販売申請はユーザー操作のままです。
              </p>
            </div>
            <div className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-black text-green-700">
              {passedCheckCount}/{checks.length} チェックOK
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid min-w-0 grid-cols-1 gap-5 p-5 pt-0 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid min-w-0 grid-cols-1 gap-3">
            <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
              <label className="grid min-w-0 gap-1 text-sm font-bold">
                タイトル（日本語）
                <Input value={titleJa} onChange={(event) => setTitleJa(event.target.value)} />
              </label>
              <label className="grid min-w-0 gap-1 text-sm font-bold">
                タイトル（英語）
                <Input value={titleEn} onChange={(event) => setTitleEn(event.target.value)} />
              </label>
            </div>
            <label className="grid min-w-0 gap-1 text-sm font-bold">
              説明文（日本語）
              <textarea
                className="min-h-20 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={descriptionJa}
                onChange={(event) => setDescriptionJa(event.target.value)}
              />
            </label>
            <label className="grid min-w-0 gap-1 text-sm font-bold">
              説明文（英語）
              <textarea
                className="min-h-16 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={descriptionEn}
                onChange={(event) => setDescriptionEn(event.target.value)}
              />
            </label>
            <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
              <label className="grid min-w-0 gap-1 text-sm font-bold">
                クリエイター名
                <Input
                  value={creatorName}
                  onChange={(event) => setCreatorName(event.target.value)}
                />
              </label>
              <label className="grid min-w-0 gap-1 text-sm font-bold">
                コピーライト
                <Input value={copyright} onChange={(event) => setCopyright(event.target.value)} />
              </label>
            </div>
            <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
              <input
                className="mt-1 size-4 accent-[#06c755]"
                checked={containsAiGeneratedContent}
                type="checkbox"
                onChange={(event) => setContainsAiGeneratedContent(event.target.checked)}
              />
              <span>
                AI生成またはAI補助で制作したコンテンツとして扱われる可能性があります。販売画面の表記や最新ガイドラインを確認してください。
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border bg-zinc-50 p-4">
            <div className="flex items-center gap-2 text-sm font-black">
              <FileJson className="size-4 text-[#06c755]" />
              入力前プレビュー
            </div>
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">キャラクターシート</dt>
                <dd className="font-bold text-right">{project.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">スタンプ数</dt>
                <dd className="font-bold">{project.stickerCount}個</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">ZIPステータス</dt>
                <dd className="font-bold text-green-700">生成可能</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">AI生成</dt>
                <dd className="font-bold">{containsAiGeneratedContent ? "あり" : "なし"}</dd>
              </div>
            </dl>
            <Button
              className="h-auto min-h-12 whitespace-normal rounded-xl line-bg px-4 py-3 text-center font-black leading-5"
              disabled={isCreatingPack}
              onClick={handleCreateSubmissionPack}
            >
              <ShieldCheck data-icon="inline-start" />
              Creators Market 出品アシスタントを使う
            </Button>
            {submissionPack ? (
              <div className="grid gap-3 rounded-xl border border-green-200 bg-white p-3 text-sm">
                <div className="font-black text-green-700">申請パックURLを発行済み</div>
                <p className="break-all text-xs leading-5 text-muted-foreground">
                  {submissionPack.manifestUrl}
                </p>
                <p className="text-xs text-muted-foreground">
                  有効期限：
                  {new Intl.DateTimeFormat("ja-JP", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(submissionPack.expiresAt))}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button variant="outline" onClick={handleCopyManifestUrl}>
                    <Copy data-icon="inline-start" />
                    URLをコピー
                  </Button>
                  <Button asChild variant="outline">
                    <a href={submissionPack.manifestUrl} rel="noreferrer" target="_blank">
                      <ExternalLink data-icon="inline-start" />
                      JSONを確認
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed bg-white p-3 text-xs leading-5 text-muted-foreground">
                発行されたURLをChrome拡張のサイドパネルに貼り付けると、タイトル、説明文、コピーライトなどを入力前に確認できます。
              </p>
            )}
            <p className="text-xs leading-5 text-muted-foreground">
              本サービスはLINE公式サービスではありません。審査通過を保証するものではありません。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
