import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { getStickerCellUrl } from "@/lib/generated-assets";
import type { StickerCount, StickerPreviewItem } from "@/lib/types";

type SlicedPreviewProps = {
  stickerCount: StickerCount;
  items: StickerPreviewItem[];
  projectId?: string;
  assetVersion?: string | number | null;
  assetsReady?: boolean;
};

export function SlicedPreview({
  stickerCount,
  items,
  projectId,
  assetVersion,
  assetsReady = true,
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
              {assetsReady ? (
                <GeneratedAssetImage
                  alt={`切り出し済みスタンプ ${item.id}`}
                  className="size-full"
                  fallbackSrc={getStickerCellUrl(item.id)}
                  imageClassName="object-contain"
                  src={`${getStickerCellUrl(item.id, projectId)}${versionSuffix}`}
                />
              ) : (
                <span className="text-xs font-black text-muted-foreground">{item.id}</span>
              )}
            </div>
          ))}
          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border bg-zinc-50 text-sm font-black text-muted-foreground">
            ...
          </div>
        </div>
        {!assetsReady ? (
          <p className="mt-3 rounded-lg border border-dashed bg-zinc-50 px-3 py-2 text-xs font-semibold leading-5 text-muted-foreground">
            まだ切り出し対象のスタンプ画像がありません。スタンプ生成後に自動スライス結果を表示します。
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
