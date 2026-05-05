"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AiContentNoticeCard } from "@/components/dashboard/AiContentNoticeCard";
import { AppMobileNav } from "@/components/dashboard/AppMobileNav";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { CharacterSheetCard } from "@/components/dashboard/CharacterSheetCard";
import { CreatorsMarketCheckCard } from "@/components/dashboard/CreatorsMarketCheckCard";
import { ExportPanel } from "@/components/dashboard/ExportPanel";
import { PhraseTemplateCard } from "@/components/dashboard/PhraseTemplateCard";
import { ProjectHeader } from "@/components/dashboard/ProjectHeader";
import { SlicedPreview } from "@/components/dashboard/SlicedPreview";
import { StickerConfigCard } from "@/components/dashboard/StickerConfigCard";
import { StickerSheetPreview } from "@/components/dashboard/StickerSheetPreview";
import { TextModeCard } from "@/components/dashboard/TextModeCard";
import { WorkflowStepper } from "@/components/dashboard/WorkflowStepper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { phraseTemplateTexts } from "@/lib/constants";
import {
  mockCharacterSheet,
  mockCheckResults,
  mockProject,
  mockStickerPhrases,
  mockWorkflowSteps,
} from "@/lib/mock-data";
import { recentProjects } from "@/lib/operational-data";
import {
  createProjectId,
  findStoredProjectDraft,
  getStatusLabel,
  saveProjectDraft,
} from "@/lib/project-drafts";
import { createStickerPreviewItems } from "@/lib/sticker-grid";
import type { Project, ProjectCreationDraft, ProjectStatus, StickerCount, TextMode } from "@/lib/types";

type DialogState = "regenerate" | "text" | "phrase" | "aiNotice" | "rename" | "memo" | null;

type ProjectDashboardProps = {
  projectId?: string;
};

function statusFromLabel(label?: string): ProjectStatus {
  if (label === "下書き") {
    return "draft";
  }

  if (label === "書き出し済み") {
    return "exported";
  }

  if (label === "生成中") {
    return "generating";
  }

  return "review_ready";
}

function getInitialProject(projectId?: string): Project {
  const normalizedId = !projectId || projectId === "demo" ? mockProject.id : projectId;
  const recentProject = recentProjects.find((project) => project.id === normalizedId);

  return {
    ...mockProject,
    id: normalizedId,
    name: recentProject?.name ?? mockProject.name,
    status: statusFromLabel(recentProject?.statusLabel),
    stickerCount: recentProject?.stickerCount ?? mockProject.stickerCount,
  };
}

export function ProjectDashboard({ projectId = "demo" }: ProjectDashboardProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project>(() => getInitialProject(projectId));
  const [stickerCount, setStickerCount] = useState<StickerCount>(() => getInitialProject(projectId).stickerCount);
  const [textMode, setTextMode] = useState<TextMode>(mockProject.textMode);
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>(
    phraseTemplateTexts.slice(0, getInitialProject(projectId).stickerCount)
  );
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogInput, setDialogInput] = useState("");

  useEffect(() => {
    const normalizedId = projectId === "demo" ? mockProject.id : projectId;
    const storedProject = findStoredProjectDraft(normalizedId);

    if (storedProject) {
      setProject({
        id: storedProject.id,
        name: storedProject.name,
        status: storedProject.status,
        stickerCount: storedProject.stickerCount,
        studioName: storedProject.studioName,
        textMode: storedProject.textMode,
        zipSizeEstimateMb: 3.2,
      });
      setStickerCount(storedProject.stickerCount);
      setTextMode(storedProject.textMode);
      setSelectedPhrases(storedProject.phrases.slice(0, storedProject.stickerCount));
      return;
    }

    const initialProject = getInitialProject(projectId);
    setProject(initialProject);
    setStickerCount(initialProject.stickerCount);
    setTextMode(initialProject.textMode);
    setSelectedPhrases(phraseTemplateTexts.slice(0, initialProject.stickerCount));
  }, [projectId]);

  const currentProject = useMemo(
    () => ({
      ...project,
      stickerCount,
      textMode,
    }),
    [project, stickerCount, textMode]
  );

  const previewItems = useMemo(
    () => createStickerPreviewItems(mockStickerPhrases, stickerCount),
    [stickerCount]
  );

  const handlePhraseToggle = (phrase: string) => {
    setSelectedPhrases((current) =>
      current.includes(phrase)
        ? current.filter((item) => item !== phrase)
        : [...current, phrase]
    );
  };

  const handleDialogSubmit = () => {
    if (dialog === "rename" && dialogInput.trim()) {
      const nextName = dialogInput.trim();
      setProject((current) => ({ ...current, name: nextName }));

      const storedProject = findStoredProjectDraft(project.id);
      if (storedProject) {
        saveProjectDraft({
          ...storedProject,
          name: nextName,
          title: {
            ...storedProject.title,
            ja: nextName,
          },
          updatedAt: new Date().toISOString(),
        });
      }

      toast.success("プロジェクト名を更新しました");
    }

    if (dialog === "memo") {
      toast.success("制作メモを保存しました");
    }

    if (dialog === "phrase" && dialogInput.trim()) {
      setSelectedPhrases((current) => [...current, dialogInput.trim()]);
      toast.success("セリフを追加しました");
    }

    if (dialog === "regenerate") {
      toast.success("対象コマの再生成リクエストを受け付けました");
    }

    if (dialog === "text") {
      toast.success("文字修正のダミー処理を開始しました");
    }

    setDialog(null);
    setDialogInput("");
  };

  const dialogCopy = {
    regenerate: {
      title: "特定コマを再生成",
      description: "修正したいコマ番号と内容を入力してください。MVPではダミー処理として扱います。",
      placeholder: "例: 12番の表情をもっと笑顔にする",
      submit: "再生成する",
    },
    text: {
      title: "文字だけ修正",
      description: "あと乗せ・ハイブリッド用に、修正したい文字内容を入力してください。",
      placeholder: "例: ありがとう を ありがとうございます に変更",
      submit: "修正する",
    },
    phrase: {
      title: "セリフを追加",
      description: "テンプレートに加えたい短い日本語セリフを入力してください。",
      placeholder: "例: 後で確認します",
      submit: "追加する",
    },
    aiNotice: {
      title: "AI生成コンテンツについて",
      description:
        "本MVPはAI生成またはAI補助の制作フローを想定しています。販売時の表示や権利確認は各マーケットの最新ガイドラインに従ってください。",
      placeholder: "",
      submit: "確認しました",
    },
    rename: {
      title: "プロジェクト名を編集",
      description: "一覧、申請パック、編集画面で使うプロジェクト名を更新します。",
      placeholder: "例: 魔法うさぎスタンプ Vol.2",
      submit: "更新する",
    },
    memo: {
      title: "制作メモ",
      description: "キャラクターの注意点や修正方針をメモできます。MVPでは画面内の確認ログとして保存します。",
      placeholder: "例: 耳の先端は必ずピンク。広告っぽい表現は避ける。",
      submit: "保存する",
    },
  } satisfies Record<Exclude<DialogState, null>, { title: string; description: string; placeholder: string; submit: string }>;

  const activeDialogCopy = dialog ? dialogCopy[dialog] : null;

  const openRenameDialog = () => {
    setDialogInput(project.name);
    setDialog("rename");
  };

  const duplicateProject = () => {
    const now = new Date().toISOString();
    const duplicateName = `${project.name} コピー`;
    const draft: ProjectCreationDraft = {
      id: createProjectId(duplicateName),
      name: duplicateName,
      studioName: project.studioName,
      status: "draft",
      stickerCount,
      textMode,
      characterType: "白うさぎ",
      style: "かわいいマジシャン風",
      colorTheme: "白、黒、緑、ピンク、オレンジ",
      costumeAndProps: "シルクハット、マント、星のステッキ",
      personality: "明るく丁寧。日常会話で使いやすい表情が多い。",
      usageScene: "既存プロジェクトを複製して、セリフや構成を調整する制作フロー",
      title: {
        ja: duplicateName,
      },
      description: {
        ja: "複製したプロジェクトです。Creators Market向けの説明文を編集してから書き出してください。",
      },
      creatorName: project.studioName,
      copyright: `© ${project.studioName}`,
      containsAiGeneratedContent: true,
      phrases: selectedPhrases.slice(0, stickerCount),
      createdAt: now,
      updatedAt: now,
    };

    saveProjectDraft(draft);
    toast.success("プロジェクトを複製しました");
    router.push(`/app/projects/${draft.id}`);
  };

  const copyPreviewUrl = () => {
    if (typeof window === "undefined") {
      return;
    }

    const url = `${window.location.origin}/app/projects/${project.id}`;
    void window.navigator.clipboard.writeText(url).then(
      () => toast.success("プレビューURLをコピーしました"),
      () => toast.error("クリップボードへコピーできませんでした")
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="flex">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <ProjectHeader
            projectName={project.name}
            statusLabel={getStatusLabel(project.status)}
            onActionDialog={(action) => setDialog(action)}
            onRenameProject={openRenameDialog}
            onOptimizePadding={() => toast.success("余白を約10pxに最適化しました")}
            onDuplicateProject={duplicateProject}
            onCopyPreviewUrl={copyPreviewUrl}
            onOpenMemo={() => {
              setDialogInput("");
              setDialog("memo");
            }}
          />
          <AppMobileNav active="プロジェクト" />
          <WorkflowStepper steps={mockWorkflowSteps} />

          <main className="grid gap-6 px-5 pb-8 xl:grid-cols-[minmax(0,1fr)_minmax(480px,0.95fr)] xl:px-8">
            <section className="flex min-w-0 flex-col gap-5">
              <div id="character-sheet">
                <CharacterSheetCard items={mockCharacterSheet} />
              </div>
              <div className="grid gap-5 2xl:grid-cols-[0.95fr_1.3fr]">
                <StickerConfigCard value={stickerCount} onChange={setStickerCount} />
                <TextModeCard value={textMode} onChange={setTextMode} />
              </div>
              <PhraseTemplateCard
                onAddClick={() => setDialog("phrase")}
                onToggle={handlePhraseToggle}
                phrases={phraseTemplateTexts}
                selected={selectedPhrases}
              />
              <div id="checks">
                <CreatorsMarketCheckCard checks={mockCheckResults} />
              </div>
              <AiContentNoticeCard onDetailsClick={() => setDialog("aiNotice")} />
            </section>

            <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-28 xl:self-start">
              <div id="sticker-set">
                <StickerSheetPreview items={previewItems} stickerCount={stickerCount} />
              </div>
              <SlicedPreview items={previewItems} stickerCount={stickerCount} />
              <div id="export">
                <ExportPanel checks={mockCheckResults} phrases={mockStickerPhrases} project={currentProject} />
              </div>
            </aside>
          </main>
        </div>
      </div>

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          {activeDialogCopy ? (
            <>
              <DialogHeader>
                <DialogTitle>{activeDialogCopy.title}</DialogTitle>
                <DialogDescription>{activeDialogCopy.description}</DialogDescription>
              </DialogHeader>
              {dialog === "memo" ? (
                <textarea
                  autoFocus
                  className="min-h-32 rounded-md border border-input bg-white px-3 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  onChange={(event) => setDialogInput(event.target.value)}
                  placeholder={activeDialogCopy.placeholder}
                  value={dialogInput}
                />
              ) : dialog !== "aiNotice" ? (
                <Input
                  autoFocus
                  onChange={(event) => setDialogInput(event.target.value)}
                  placeholder={activeDialogCopy.placeholder}
                  value={dialogInput}
                />
              ) : null}
              <DialogFooter>
                <Button onClick={handleDialogSubmit}>{activeDialogCopy.submit}</Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
