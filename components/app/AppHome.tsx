import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileArchive,
  ShieldCheck,
  Plus,
  Smile,
  WandSparkles,
} from "lucide-react";

import { AppFrame } from "@/components/app/AppFrame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appMetrics, productionChecklist, recentProjects } from "@/lib/operational-data";

export function AppHome() {
  return (
    <AppFrame
      active="ダッシュボード"
      action={
        <Button asChild className="line-bg">
          <Link href="/app/projects/new">
            シート作成
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      }
      description="制作状況、生成クレジット、チェック結果を一画面で確認できます。"
      title="ダッシュボード"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {appMetrics.map((metric) => (
          <Card className="rounded-xl bg-white shadow-sm" key={metric.label}>
            <CardContent className="p-5">
              <p className="text-sm font-bold text-muted-foreground">{metric.label}</p>
              <p className="mt-3 text-3xl font-black text-zinc-950">{metric.value}</p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{metric.helper}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <Card className="rounded-xl bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-xl font-black">最近のキャラクターシート</CardTitle>
            <Button asChild variant="outline">
              <Link href="/app/projects">すべて見る</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentProjects.map((project) => (
              <Link
                className="flex flex-col gap-3 rounded-xl border bg-zinc-50 p-4 transition hover:border-green-200 hover:bg-green-50/40 sm:flex-row sm:items-center sm:justify-between"
                href={project.id === "magic-rabbit-vol-1" ? "/app/projects/demo" : `/app/projects/${project.id}`}
                key={project.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-zinc-950">{project.name}</p>
                    <Badge
                      className={
                        project.statusTone === "line"
                          ? "bg-green-100 text-green-700"
                          : project.statusTone === "green"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-zinc-100 text-zinc-700"
                      }
                      variant="secondary"
                    >
                      {project.statusLabel}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    {project.progress} / {project.stickerCount}個 / 更新 {project.updatedAt}
                  </p>
                </div>
                <ArrowRight className="text-muted-foreground" aria-hidden="true" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="rounded-xl border-green-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <WandSparkles className="line-green" aria-hidden="true" />
                次にやること
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button asChild className="justify-start line-bg">
                <Link href="/app/projects/new">
                  <Plus data-icon="inline-start" />
                  キャラクターシートを作成
                </Link>
              </Button>
              <Button asChild className="justify-start" variant="outline">
                <Link href="/app/projects/demo">
                  <Smile data-icon="inline-start" />
                  デモシートを編集
                </Link>
              </Button>
              <Button asChild className="justify-start" variant="outline">
                <Link href="/app/templates">
                  <WandSparkles data-icon="inline-start" />
                  セリフテンプレートを見る
                </Link>
              </Button>
              <Button asChild className="justify-start" variant="outline">
                <Link href="/app/billing">
                  <FileArchive data-icon="inline-start" />
                  プランと利用量を確認
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <ShieldCheck className="text-emerald-600" aria-hidden="true" />
                運用前チェック
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {productionChecklist.map((item) => (
                <div className="flex items-start gap-2 text-sm font-semibold" key={item}>
                  <CheckCircle2 className="mt-0.5 text-emerald-600" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </AppFrame>
  );
}
