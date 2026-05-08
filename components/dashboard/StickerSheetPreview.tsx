import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { getStickerCellUrl } from "@/lib/generated-assets";
import { getStickerGrid } from "@/lib/sticker-grid";
import type { StickerCount, StickerPreviewItem, TextMode } from "@/lib/types";

type StickerSheetPreviewProps = {
  stickerCount: StickerCount;
  items: StickerPreviewItem[];
  projectId?: string;
  assetVersion?: string | number | null;
  assetsReady?: boolean;
  textMode?: TextMode;
};

export function StickerSheetPreview({
  stickerCount,
  items,
  projectId,
  assetVersion,
  assetsReady = true,
  textMode = "hybrid",
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
              {assetsReady ? (
                <GeneratedAssetImage
                  alt={`${item.phrase.text}のスタンプ画像`}
                  className="size-full"
                  fallbackSrc={getStickerCellUrl(item.id)}
                  imageClassName="object-contain"
                  src={`${getStickerCellUrl(item.id, projectId)}${versionSuffix}`}
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 rounded-md bg-zinc-50 px-2 text-center">
                  <span className="sticker-text max-w-full truncate text-[clamp(10px,0.95vw,16px)] leading-tight">
                    {item.phrase.text}
                  </span>
                  <span className="text-[11px] font-black text-muted-foreground">生成待ち</span>
                </div>
              )}
            </div>
          ))}
        </div>
        {!assetsReady ? (
          <p className="mt-3 rounded-lg border border-dashed bg-zinc-50 px-3 py-2 text-xs font-semibold leading-5 text-muted-foreground">
            スタンプ生成を実行すると、このキャラクターのスタンプ画像に差し替わります。
          </p>
        ) : textMode === "overlay" ? (
          <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold leading-5 text-green-900">
            生成済み画像にUI側の文字は重ねていません。文字あと乗せは書き出し工程で合成する想定です。
          </p>
        ) : stickerCount > 24 ? (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-900">
            デモでは25個目以降も実PNGセルで埋めています。選択数で生成ジョブを実行すると、このキャラクターの新しいシートに差し替わります。
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
