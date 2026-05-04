import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { StickerMock } from "@/components/ui/StickerMock";
import { generatedAssetUrls } from "@/lib/generated-assets";
import { getStickerGrid } from "@/lib/sticker-grid";
import type { StickerCount, StickerPreviewItem } from "@/lib/types";

type StickerSheetPreviewProps = {
  stickerCount: StickerCount;
  items: StickerPreviewItem[];
};

export function StickerSheetPreview({ stickerCount, items }: StickerSheetPreviewProps) {
  const grid = getStickerGrid(stickerCount);
  const isDenseGrid = stickerCount >= 32;
  const rowHeight = stickerCount === 40 ? "96px" : stickerCount === 32 ? "104px" : stickerCount === 24 ? "112px" : "122px";

  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-black">
          スタンプシートプレビュー（{stickerCount}個）
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stickerCount === 24 ? (
          <div className="relative overflow-hidden rounded-xl border bg-white p-3">
            <GeneratedAssetImage
              alt="白うさぎマジシャンの24個スタンプシート"
              className="aspect-[6/4] w-full"
              imageClassName="object-cover"
              src={generatedAssetUrls.stickerSheet24}
            />
            <div className="pointer-events-none absolute inset-3 grid grid-cols-6 grid-rows-4">
              {items.map((item) => (
                <span
                  className="sticker-text flex items-start justify-center pt-1 text-[clamp(10px,1.2vw,17px)]"
                  key={item.id}
                >
                  {item.phrase.text}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="grid gap-2 rounded-xl border bg-white p-3"
            style={{
              gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
              gridAutoRows: rowHeight,
            }}
          >
            {items.map((item) => (
              <div
                className="flex min-w-0 items-center justify-center rounded-lg border border-zinc-100 bg-white p-1"
                key={item.id}
              >
                <StickerMock
                  className="min-h-0 size-full p-0.5"
                  density={isDenseGrid ? "compact" : "normal"}
                  effect={item.effect}
                  phrase={item.phrase.text}
                  pose={item.phrase.pose}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
