import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductPreview } from "@/components/site/ProductPreview";

const benefits = ["クレカ不要", "すぐに使える", "安心の日本語サポート"];

export function HeroSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1480px] items-start gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:py-14">
        <div className="flex flex-col items-start gap-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
            <Sparkles data-icon="inline-start" />
            AIで、LINEスタンプ制作をもっと簡単に
          </div>

          <div className="flex flex-col gap-5">
            <h1 className="text-4xl font-black leading-[1.16] text-zinc-950 sm:text-5xl lg:text-[58px]">
              <span className="block sm:whitespace-nowrap">キャラクターシートから</span>
              <span className="block sm:whitespace-nowrap">
                LINEスタンプを
                <span className="line-green">一気に作成</span>
              </span>
            </h1>
            <p className="max-w-2xl text-base font-medium leading-8 text-zinc-700 sm:text-lg">
              キャラクターシート生成 → スタンプシート生成 → 自動スライス →
              LINE Creators Market用ZIP書き出しまで、すべてをAIで自動化。
              <span className="block">高品質なスタンプを、もっと速く、もっと簡単に。</span>
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="line-bg h-13 min-w-48 rounded-xl text-base font-bold shadow-lg shadow-green-500/20"
              size="lg"
            >
              <Link href="/register">
                無料で試す
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              className="h-13 min-w-44 rounded-xl bg-white text-base font-bold"
              size="lg"
              variant="outline"
            >
              <Link href="/demo">
                デモを見る
                <PlayCircle data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-zinc-600">
            {benefits.map((benefit) => (
              <span className="flex items-center gap-2" key={benefit}>
                <CheckCircle2 className="text-emerald-600" aria-hidden="true" />
                {benefit}
              </span>
            ))}
          </div>
        </div>

        <ProductPreview />
      </div>
    </section>
  );
}
