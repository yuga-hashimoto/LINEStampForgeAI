import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { getStickerCellUrl } from "@/lib/generated-assets";
import { getStickerGrid } from "@/lib/sticker-grid";
import type { StickerCount, StickerPreviewItem } from "@/lib/types";

type StickerSheetPreviewProps = {
  stickerCount: StickerCount;
  items: StickerPreviewItem[];
  projectId?: string;
  assetVersion?: string | number | null;
};

export function StickerSheetPreview({
  stickerCount,
  items,
  projectId,
  assetVersion,
}: StickerSheetPreviewProps) {
  const grid = getStickerGrid(stickerCount);
  const versionSuffix = assetVersion ? `?v=${encodeURIComponent(String(assetVersion))}` : "";
  const rowHeight =
    stickerCount === 40
      ? "112px"
      : stickerCount === 32
        ? "118px"
        : stickerCount === 24
          ? "132px"
          : "144px";

  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-black">
          スタンプシートプレビュー（{stickerCount}個）
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="grid gap-2 rounded-xl border bg-white p-3"
          style={{
            gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
            gridAutoRows: rowHeight,
          }}
        >
          {items.map((item) => (
            <div
              className="relative flex min-w-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-100 bg-white p-1"
              key={item.id}
            >
              <GeneratedAssetImage
                alt={`${item.phrase.text}のスタンプ画像`}
                className="size-full"
                fallbackSrc={getStickerCellUrl(item.id)}
                imageClassName="object-contain"
                src={`${getStickerCellUrl(item.id, projectId)}${versionSuffix}`}
              />
              <div className="pointer-events-none absolute inset-x-1 top-1 flex justify-center">
                <span className="sticker-text max-w-full truncate text-[clamp(10px,0.95vw,16px)] leading-tight">
                  {item.phrase.text}
                </span>
              </div>
            </div>
          ))}
        </div>
        {stickerCount > 24 ? (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-900">
            デモでは25個目以降も実PNGセルで埋めています。選択数で生成ジョブを実行すると、このキャラクターの新しいシートに差し替わります。
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
