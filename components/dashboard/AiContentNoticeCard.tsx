import { ExternalLink, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type AiContentNoticeCardProps = {
  onDetailsClick: () => void;
};

export function AiContentNoticeCard({ onDetailsClick }: AiContentNoticeCardProps) {
  return (
    <Card className="rounded-xl border-yellow-200 bg-yellow-50 shadow-sm">
      <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-yellow-700 shadow-sm">
            <Sparkles aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-black text-zinc-950">AI生成コンテンツ</h3>
            <div className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-zinc-700">
              <p>本キャラクターシートとスタンプ画像は、AIによる支援を受けて生成・編集されたコンテンツを含みます。</p>
              <p>販売画面ではAI生成コンテンツに関する表記が表示されることがあります。</p>
              <p>本サービスは審査通過を保証するものではありません。</p>
            </div>
          </div>
        </div>
        <Button className="shrink-0 bg-white" onClick={onDetailsClick} variant="outline">
          詳細を確認
          <ExternalLink data-icon="inline-end" />
        </Button>
      </CardContent>
    </Card>
  );
}
