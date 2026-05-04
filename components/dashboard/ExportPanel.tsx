import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { exportZip } from "@/lib/api-stubs";
import { generatedAssetUrls } from "@/lib/generated-assets";
import type { CheckItem, Project, StickerPhrase } from "@/lib/types";

type ExportPanelProps = {
  project: Project;
  phrases: StickerPhrase[];
  checks: CheckItem[];
};

export function ExportPanel({ project, phrases, checks }: ExportPanelProps) {
  const handleExport = async () => {
    toast.info("MVPではダミーZIPを書き出します");
    const result = await exportZip({ project, phrases, checks });
    const url = URL.createObjectURL(result.blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`ダミーZIPを生成しました（${result.sizeMb}MB）`);
  };

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.5fr]">
      <Card className="rounded-xl bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-black">メイン画像（240×240px）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="checkerboard mx-auto flex aspect-square max-w-32 items-center justify-center rounded-xl border p-3">
            <GeneratedAssetImage
              alt="メイン画像用マスコット"
              className="size-full rounded-lg"
              src={generatedAssetUrls.mascot}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-black">タブ画像（96×74px）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="checkerboard mx-auto flex aspect-[96/74] max-w-32 items-center justify-center rounded-xl border p-2">
            <GeneratedAssetImage
              alt="タブ画像用マスコット"
              className="size-full rounded-lg"
              src={generatedAssetUrls.mascot}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl bg-white shadow-sm">
        <CardContent className="flex h-full flex-col justify-center gap-4 p-5">
          <Button
            className="h-16 rounded-xl line-bg text-lg font-black shadow-lg shadow-green-500/20"
            onClick={handleExport}
          >
            <Download data-icon="inline-start" />
            ZIPを書き出す
          </Button>
          <p className="text-center text-sm font-semibold text-muted-foreground">
            ZIPサイズの目安：{project.zipSizeEstimateMb}MB
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
