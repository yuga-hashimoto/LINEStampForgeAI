"use client";

import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StickerMock } from "@/components/ui/StickerMock";
import { mockAddOnOptions, mockOneShotPlans, mockSubscriptionPlans } from "@/lib/mock-data";
import { formatYen } from "@/lib/utils";

export function PricingSection() {
  return (
    <section className="border-y bg-zinc-50 py-14" id="pricing">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="mb-7 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black line-green">料金プラン</p>
            <h2 className="mt-2 text-3xl font-black text-zinc-950">単発売りを主軸に、継続制作にも対応</h2>
            <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-muted-foreground">
              個人制作は買い切りで始めやすく、クリエイター・制作代行・店舗・法人向けには
              月額プランを用意しています。各プランには生成回数・書き出し数の上限があります。
            </p>
          </div>
        </div>

        <Tabs defaultValue="one-shot">
          <TabsList className="mb-6 h-11 rounded-xl bg-white p-1 shadow-sm">
            <TabsTrigger className="rounded-lg px-5 py-2 text-sm font-bold" value="one-shot">
              単発売り
            </TabsTrigger>
            <TabsTrigger className="rounded-lg px-5 py-2 text-sm font-bold" value="monthly">
              クリエイター月額
            </TabsTrigger>
          </TabsList>

          <TabsContent value="one-shot">
            <div className="grid gap-4 lg:grid-cols-5">
              {mockOneShotPlans.map((plan) => (
                <Card
                  className={
                    plan.popular
                      ? "relative rounded-xl border-2 border-[#06C755] bg-white shadow-xl shadow-green-500/10"
                      : "rounded-xl bg-white shadow-sm"
                  }
                  key={plan.id}
                >
                  {plan.popular ? (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 line-bg text-white">
                      人気No.1
                    </Badge>
                  ) : null}
                  <CardHeader className="gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg font-black">{plan.name}</CardTitle>
                        <p className="mt-2 min-h-10 text-sm font-medium leading-5 text-muted-foreground">
                          {plan.description}
                        </p>
                      </div>
                      <StickerMock
                        className="hidden size-20 min-h-20 shrink-0 border bg-green-50 p-1 xl:flex"
                        effect="✨"
                        phrase=""
                        showText={false}
                      />
                    </div>
                    <div>
                      <span className="text-3xl font-black">{formatYen(plan.price)}</span>
                      <span className="ml-1 text-sm font-semibold text-muted-foreground">/ セット</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {plan.features.map((feature) => (
                        <span className="flex items-start gap-2 text-sm font-semibold" key={feature}>
                          <CheckCircle2 className="mt-0.5 text-emerald-600" aria-hidden="true" />
                          {feature}
                        </span>
                      ))}
                      <span className="flex items-start gap-2 text-sm font-semibold">
                        <CheckCircle2 className="mt-0.5 text-emerald-600" aria-hidden="true" />
                        含まれる再生成: {plan.includedRegenerations}回
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      className={plan.popular ? "w-full line-bg" : "w-full"}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      <Link href="/register">この内容で試す</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-5 rounded-xl border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="line-green" aria-hidden="true" />
                <h3 className="text-lg font-black">追加オプション</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {mockAddOnOptions.map((option) => (
                  <div className="rounded-lg border bg-zinc-50 p-4" key={option.id}>
                    <p className="font-bold text-zinc-950">{option.name}</p>
                    <p className="mt-1 text-lg font-black line-green">{option.priceLabel}</p>
                    <p className="mt-2 text-sm font-medium leading-5 text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly">
            <div className="grid gap-4 lg:grid-cols-3">
              {mockSubscriptionPlans.map((plan) => (
                <Card
                  className={
                    plan.recommended
                      ? "relative rounded-xl border-2 border-[#06C755] bg-white shadow-xl shadow-green-500/10"
                      : "rounded-xl bg-white shadow-sm"
                  }
                  key={plan.id}
                >
                  {plan.recommended ? (
                    <Badge className="absolute -top-3 left-6 line-bg text-white">
                      制作継続におすすめ
                    </Badge>
                  ) : null}
                  <CardHeader>
                    <CardTitle className="text-xl font-black">{plan.name}</CardTitle>
                    <p className="text-sm font-medium text-muted-foreground">{plan.description}</p>
                    <div className="pt-2">
                      <span className="text-3xl font-black">{formatYen(plan.priceMonthly)}</span>
                      <span className="ml-1 text-sm font-semibold text-muted-foreground">/ 月</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-green-50 p-3">
                        <p className="text-xs font-bold text-green-700">書き出し</p>
                        <p className="mt-1 text-sm font-black">{plan.exportLimit}</p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-3">
                        <p className="text-xs font-bold text-emerald-700">生成クレジット</p>
                        <p className="mt-1 text-sm font-black">{plan.credits} / 月</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {plan.features.map((feature) => (
                        <span className="flex items-start gap-2 text-sm font-semibold" key={feature}>
                          <CheckCircle2 className="mt-0.5 text-emerald-600" aria-hidden="true" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      className={plan.recommended ? "w-full line-bg" : "w-full"}
                      variant={plan.recommended ? "default" : "outline"}
                    >
                      <Link href="/register">プランを見る</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
