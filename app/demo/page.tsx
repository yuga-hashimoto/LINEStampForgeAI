import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, ClipboardCheck, PlayCircle, WandSparkles } from "lucide-react";

import { MarketingShell } from "@/components/site/MarketingShell";
import { ProductPreview } from "@/components/site/ProductPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "デモ | StampForge AI",
  description: "StampForge AIの制作ダッシュボードとZIP書き出しまでのデモ導線です。",
};

const demoSteps = [
  "24個のスタンプシートを確認",
  "8 / 16 / 24 / 32 / 40個の構成を切り替え",
  "文字モードとセリフテンプレートを変更",
  "自動チェック結果とAI生成コンテンツ注意を確認",
  "manifest.json入りのダミーZIPを書き出し",
];

export default function DemoPage() {
  return (
    <MarketingShell>
      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-[1480px] gap-9 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <Badge className="bg-green-100 text-green-700" variant="secondary">
              ログイン不要のプロダクトデモ
            </Badge>
            <h1 className="mt-5 text-4xl font-black leading-tight text-zinc-950 sm:text-5xl">
              制作パイプラインを
              <span className="line-green">実画面で確認</span>
            </h1>
            <p className="mt-5 text-base font-medium leading-8 text-zinc-700">
              キャラクターシート生成からスタンプセット生成、自動スライス、Creators Market向けチェック、
              ZIP書き出しまでを、デモシートでそのまま操作できます。
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="line-bg" size="lg">
                <Link href="/app/projects/demo">
                  デモを開く
                  <PlayCircle data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/register">
                  無料で試す
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="border-y bg-zinc-50 py-12">
        <div className="mx-auto grid max-w-[1180px] gap-5 px-5 sm:px-8 md:grid-cols-2">
          <Card className="rounded-xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <WandSparkles className="line-green" aria-hidden="true" />
                デモでできること
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {demoSteps.map((step) => (
                <div className="flex items-start gap-2 text-sm font-semibold" key={step}>
                  <CheckCircle2 className="mt-0.5 text-emerald-600" aria-hidden="true" />
                  <span>{step}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="rounded-xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <ClipboardCheck className="line-green" aria-hidden="true" />
                運用前の確認観点
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium leading-7 text-muted-foreground">
                デモは実決済・実画像生成を行いません。画面導線、サイズチェック、AI生成コンテンツ注意、
                ZIP構成、API接続用の境界が成立しているかを確認するためのMVPです。
              </p>
              <Button asChild className="mt-5 w-full" variant="outline">
                <Link href="/terms">利用規約を確認</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingShell>
  );
}
