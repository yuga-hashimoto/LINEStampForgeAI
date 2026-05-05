import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { getStickerCellUrl } from "@/lib/generated-assets";
import type { StickerCount, StickerPreviewItem } from "@/lib/types";

type SlicedPreviewProps = {
  stickerCount: StickerCount;
  items: StickerPreviewItem[];
  projectId?: string;
  assetVersion?: string | number | null;
};

export function SlicedPreview({
  stickerCount,
  items,
  projectId,
  assetVersion,
}: SlicedPreviewProps) {
  const versionSuffix = assetVersion ? `?v=${encodeURIComponent(String(assetVersion))}` : "";

  return (
    <Card className="min-w-0 rounded-xl bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-black">自動切り出しプレビュー（{stickerCount}個）</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0 overflow-hidden">
        <div className="flex w-full max-w-full gap-3 overflow-x-auto pb-1">
          {items.map((item) => (
            <div
              className="checkerboard flex size-16 shrink-0 items-center justify-center rounded-lg border p-1"
              key={item.id}
            >
              <GeneratedAssetImage
                alt={`切り出し済みスタンプ ${item.id}`}
                className="size-full"
                fallbackSrc={getStickerCellUrl(item.id)}
                imageClassName="object-contain"
                src={`${getStickerCellUrl(item.id, projectId)}${versionSuffix}`}
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
