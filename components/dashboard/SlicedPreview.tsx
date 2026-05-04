import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StickerMock } from "@/components/ui/StickerMock";
import type { StickerCount, StickerPreviewItem } from "@/lib/types";

type SlicedPreviewProps = {
  stickerCount: StickerCount;
  items: StickerPreviewItem[];
};

export function SlicedPreview({ stickerCount, items }: SlicedPreviewProps) {
  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-black">自動切り出しプレビュー（{stickerCount}個）</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {items.map((item) => (
            <div
              className="checkerboard flex size-16 shrink-0 items-center justify-center rounded-lg border p-1"
              key={item.id}
            >
              <StickerMock
                className="min-h-0 size-full bg-transparent p-0"
                effect={item.effect}
                phrase=""
                showText={false}
              />
            </div>
          ))}
          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border bg-zinc-50 text-sm font-black text-muted-foreground">
            ...
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
