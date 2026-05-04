import {
  Bell,
  CheckCircle2,
  FileArchive,
  FolderOpen,
  Grid3X3,
  HelpCircle,
  Home,
  Lightbulb,
  Settings,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { generatedAssetUrls } from "@/lib/generated-assets";
import { mockStickerPhrases } from "@/lib/mock-data";

const previewNav = [
  { label: "ダッシュボード", icon: Home, active: true },
  { label: "プロジェクト", icon: FolderOpen },
  { label: "キャラシート", icon: WandSparkles },
  { label: "スタンプセット", icon: Grid3X3 },
  { label: "書き出し", icon: FileArchive },
  { label: "設定", icon: Settings },
];

export function ProductPreview() {
  return (
    <div className="panel-shadow rounded-2xl border bg-white p-3">
      <div className="grid min-h-[460px] overflow-hidden rounded-xl border bg-white lg:grid-cols-[180px_1fr]">
        <aside className="hidden border-r bg-zinc-50/70 p-4 lg:block">
          <div className="mb-6 flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg border bg-white">
              <GeneratedAssetImage
                alt="白うさぎマジシャン"
                className="size-8 rounded-md"
                src={generatedAssetUrls.mascot}
              />
            </span>
            <span className="text-sm font-bold">LINEスタンプ制作</span>
          </div>
          <div className="flex flex-col gap-2">
            {previewNav.map((item) => (
              <div
                className={
                  item.active
                    ? "flex items-center gap-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-700"
                    : "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600"
                }
                key={item.label}
              >
                <item.icon aria-hidden="true" />
                {item.label}
              </div>
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground">プロジェクト / マジックラビット</p>
              <h2 className="truncate text-sm font-bold text-zinc-950">LINEスタンプシートプレビュー</h2>
            </div>
            <div className="flex items-center gap-3 text-zinc-500">
              <Bell aria-hidden="true" />
              <HelpCircle aria-hidden="true" />
              <Badge className="bg-green-100 text-green-700" variant="secondary">
                クリエイター
              </Badge>
            </div>
          </div>

          <div className="grid flex-1 gap-4 p-4">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">LINE Creators Market向け / 24個セット</p>
                  <h3 className="text-sm font-bold">白うさぎマジシャン</h3>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700" variant="secondary">
                  スライス結果 OK
                </Badge>
              </div>
              <div className="relative overflow-hidden rounded-xl border bg-white p-3">
                <GeneratedAssetImage
                  alt="白うさぎマジシャンの24個スタンプシート"
                  className="aspect-[6/4] w-full"
                  imageClassName="object-cover"
                  src={generatedAssetUrls.stickerSheet24}
                />
                <div className="pointer-events-none absolute inset-3 grid grid-cols-6 grid-rows-4">
                  {mockStickerPhrases.slice(0, 24).map((phrase) => (
                    <span
                      className="sticker-text flex items-start justify-center pt-1 text-[10px]"
                      key={phrase.id}
                    >
                      {phrase.text}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-muted-foreground">
                画像サイズ: 370×320px以内 / PNG / 背景透過想定
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-white p-4">
                <p className="text-xs font-bold text-muted-foreground">ステータス概要</p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700" variant="secondary">
                    OK
                  </Badge>
                  <span className="text-sm font-bold">24個</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  すべての画像を確認・書き出しできます。
                </p>
                <Button className="mt-3 w-full" size="sm" variant="outline">
                  詳細を確認
                </Button>
              </div>

              <div className="rounded-xl border bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <ShieldCheck className="text-emerald-600" aria-hidden="true" />
                  ZIPダウンロード
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Creators Market向けのファイル構成で書き出します。
                </p>
              </div>

              <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-green-800">
                  <Lightbulb aria-hidden="true" />
                  Tips
                </div>
                <p className="mt-2 text-xs leading-5 text-green-800/80">
                  スタンプの並び順はドラッグで調整できます。
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border bg-white p-4 text-sm font-bold text-emerald-700">
                <CheckCircle2 aria-hidden="true" />
                自動チェック完了
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
