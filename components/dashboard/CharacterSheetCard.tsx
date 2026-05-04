import { Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { StickerMock } from "@/components/ui/StickerMock";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generatedAssetUrls } from "@/lib/generated-assets";
import type { CharacterSheetItem } from "@/lib/types";

type CharacterSheetCardProps = {
  items: CharacterSheetItem[];
};

export function CharacterSheetCard({ items }: CharacterSheetCardProps) {
  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-xl font-black">キャラクターシート</CardTitle>
        <Tooltip>
          <TooltipTrigger className="text-muted-foreground">
            <Info aria-hidden="true" />
            <span className="sr-only">キャラクターシートの説明</span>
          </TooltipTrigger>
          <TooltipContent>同じキャラクターを再現するための参照情報です。</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent>
        <div className="mb-4 overflow-hidden rounded-xl border bg-white p-3">
          <GeneratedAssetImage
            alt="白うさぎマジシャンのキャラクターシート"
            className="aspect-[3/2] w-full"
            imageClassName="object-cover"
            src={generatedAssetUrls.characterSheet}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-6">
          {items.map((item) => (
            <div className="rounded-xl border bg-zinc-50 p-3" key={item.id}>
              <p className="mb-2 text-center text-sm font-black text-zinc-700">{item.label}</p>
              {item.palette ? (
                <div className="flex min-h-[122px] items-center justify-center rounded-lg border bg-white p-3">
                  <div className="grid grid-cols-2 gap-3">
                    {item.palette.map((color) => (
                      <span
                        className="size-8 rounded-full border shadow-sm"
                        key={color}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[122px] items-center justify-center rounded-lg border bg-white p-2">
                  <StickerMock
                    angle={item.angle as "front" | "diagonal" | "side" | "back" | "expressions"}
                    className="min-h-[110px] p-1"
                    phrase=""
                    showText={false}
                    variant="character"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
