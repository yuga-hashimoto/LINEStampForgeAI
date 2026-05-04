import { ArrowRight, ClipboardCheck, MessageSquareText, PanelsTopLeft, WandSparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { bestPracticeCards } from "@/lib/constants";

const icons = [WandSparkles, MessageSquareText, PanelsTopLeft, ClipboardCheck];

export function BestPractices() {
  return (
    <section className="bg-white py-12" id="how-to">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-zinc-950">ベストプラクティス</h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              生成前の設計からレビュー前チェックまで、失敗しにくい制作順を整えます。
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {bestPracticeCards.map((card, index) => {
            const Icon = icons[index] ?? ClipboardCheck;

            return (
              <Card className="rounded-xl border-green-100 bg-white shadow-sm" key={card.number}>
                <CardContent className="flex min-h-40 gap-4 p-5">
                  <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-green-50 line-green">
                    <Icon aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black line-green">{card.number}</p>
                    <h3 className="mt-1 text-base font-black text-zinc-950">{card.title}</h3>
                    <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                      {card.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold line-green">
                      詳しく見る
                      <ArrowRight data-icon="inline-end" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
