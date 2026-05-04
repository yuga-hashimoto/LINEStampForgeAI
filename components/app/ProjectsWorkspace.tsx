"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Plus, WandSparkles } from "lucide-react";
import { toast } from "sonner";

import { AppFrame } from "@/components/app/AppFrame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { recentProjects } from "@/lib/operational-data";

const filters = ["すべて", "レビュー前", "下書き", "書き出し済み"] as const;

export function ProjectsWorkspace() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("すべて");
  const [query, setQuery] = useState("");

  const projects = useMemo(
    () =>
      recentProjects.filter((project) => {
        const matchesFilter = filter === "すべて" || project.statusLabel === filter;
        const matchesQuery = project.name.toLowerCase().includes(query.trim().toLowerCase());
        return matchesFilter && matchesQuery;
      }),
    [filter, query]
  );

  return (
    <AppFrame
      active="プロジェクト"
      action={
        <Button
          className="line-bg"
          onClick={() => toast.info("新規作成フォームは次の実装対象です。デモ編集から開始できます")}
        >
          <Plus data-icon="inline-start" />
          新規作成
        </Button>
      }
      description="スタンプ制作プロジェクトの状態、個数、書き出し状況を管理します。"
      title="プロジェクト"
    >
      <Card className="rounded-xl bg-white shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl font-black">プロジェクト一覧</CardTitle>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                デモ以外のプロジェクトも、実運用を想定した一覧状態で確認できます。
              </p>
            </div>
            <Input
              className="max-w-sm bg-white"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="プロジェクト名で検索"
              value={query}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <Button
                key={item}
                onClick={() => setFilter(item)}
                size="sm"
                variant={filter === item ? "default" : "outline"}
              >
                {item}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-3">
          {projects.map((project) => (
            <Link
              className="flex min-h-52 flex-col rounded-xl border bg-zinc-50 p-5 transition hover:border-green-200 hover:bg-green-50/40"
              href={project.id === "magic-rabbit-vol-1" ? "/app/projects/demo" : "/app/projects"}
              key={project.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <WandSparkles aria-hidden="true" />
                </div>
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
              <h2 className="mt-5 text-lg font-black text-zinc-950">{project.name}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                {project.progress}
              </p>
              <div className="mt-auto flex items-center justify-between pt-5 text-sm font-bold">
                <span>{project.stickerCount}個セット</span>
                <span className="inline-flex items-center gap-2 line-green">
                  開く
                  <ArrowRight data-icon="inline-end" />
                </span>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </AppFrame>
  );
}
