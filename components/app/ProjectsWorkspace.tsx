"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, FileImage, Plus } from "lucide-react";

import { AppFrame } from "@/components/app/AppFrame";
import { ProductionFlow } from "@/components/app/ProductionFlow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStatusLabel, getStoredProjectDrafts } from "@/lib/project-drafts";
import { recentProjects, type RecentProject } from "@/lib/operational-data";

const filters = ["すべて", "レビュー前", "下書き", "書き出し済み"] as const;

export function ProjectsWorkspace() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("すべて");
  const [query, setQuery] = useState("");
  const [storedProjects, setStoredProjects] = useState<RecentProject[]>([]);

  useEffect(() => {
    const projects = getStoredProjectDrafts().map((project): RecentProject => ({
      id: project.id,
      name: project.name,
      progress: "企画入力を保存済み",
      statusLabel: getStatusLabel(project.status),
      statusTone: project.status === "review_ready" ? "line" : project.status === "exported" ? "green" : "zinc",
      stickerCount: project.stickerCount,
      updatedAt: new Date(project.updatedAt).toLocaleDateString("ja-JP"),
    }));

    setStoredProjects(projects);
  }, []);

  const projects = useMemo(
    () => {
      const storedIds = new Set(storedProjects.map((project) => project.id));
      const mergedProjects = [
        ...storedProjects,
        ...recentProjects.filter((project) => !storedIds.has(project.id)),
      ];

      return mergedProjects.filter((project) => {
        const matchesFilter = filter === "すべて" || project.statusLabel === filter;
        const matchesQuery = project.name.toLowerCase().includes(query.trim().toLowerCase());
        return matchesFilter && matchesQuery;
      });
    },
    [filter, query, storedProjects]
  );
  const getProjectHref = (project: RecentProject) =>
    project.id === "magic-rabbit-vol-1" ? "/app/projects/demo" : `/app/projects/${encodeURIComponent(project.id)}`;

  return (
    <AppFrame
      active="キャラクターシート"
      action={
        <Button asChild className="line-bg">
          <Link href="/app/projects/new">
            <Plus data-icon="inline-start" />
            シート作成
          </Link>
        </Button>
      }
      description="作成したキャラクターシートを起点に、スタンプセットと書き出し状況を管理します。"
      title="キャラクターシート"
    >
      <div className="mb-6">
        <ProductionFlow variant="existing-character" />
      </div>
      <Card className="rounded-xl bg-white shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl font-black">キャラクターシート一覧</CardTitle>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                1枚のキャラクターシートから、8個から40個までのスタンプ展開を管理できます。
              </p>
            </div>
            <Input
              className="max-w-sm bg-white"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="キャラクターシート名で検索"
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
          {projects.map((project) => {
            const projectHref = getProjectHref(project);

            return (
            <article
              className="flex min-h-56 flex-col rounded-xl border bg-zinc-50 p-5 transition hover:border-green-200 hover:bg-green-50/30"
              key={project.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <FileImage aria-hidden="true" />
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
              <div className="mt-auto flex items-center justify-between pt-5 text-sm font-bold text-zinc-600">
                <span>{project.stickerCount}個セット</span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button asChild className="h-11 rounded-xl font-black line-bg">
                  <Link href={`${projectHref}/stamps`}>
                    スタンプ作成
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                <Button asChild className="h-11 rounded-xl font-black" variant="outline">
                  <Link href={projectHref}>
                    シート編集
                  </Link>
                </Button>
              </div>
            </article>
            );
          })}
        </CardContent>
      </Card>
    </AppFrame>
  );
}
