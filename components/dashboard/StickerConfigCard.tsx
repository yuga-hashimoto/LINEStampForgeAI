import { Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { stickerCounts } from "@/lib/constants";
import type { StickerCount } from "@/lib/types";

type StickerConfigCardProps = {
  value: StickerCount;
  onChange: (value: StickerCount) => void;
};

export function StickerConfigCard({ value, onChange }: StickerConfigCardProps) {
  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <CardTitle className="text-xl font-black">スタンプ構成</CardTitle>
        <Tooltip>
          <TooltipTrigger className="text-muted-foreground">
            <Info aria-hidden="true" />
            <span className="sr-only">スタンプ構成の説明</span>
          </TooltipTrigger>
          <TooltipContent>選択した個数に応じてプレビューのグリッドも変わります。</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent>
        <ToggleGroup
          className="grid w-full grid-cols-5 gap-3"
          onValueChange={(nextValue) => {
            if (nextValue) onChange(Number(nextValue) as StickerCount);
          }}
          type="single"
          value={String(value)}
        >
          {stickerCounts.map((count) => (
            <ToggleGroupItem
              className="h-11 rounded-lg border bg-white text-base font-black data-[state=on]:border-[#06C755] data-[state=on]:bg-green-50 data-[state=on]:text-green-700"
              key={count}
              value={String(count)}
            >
              {count}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardContent>
    </Card>
  );
}
