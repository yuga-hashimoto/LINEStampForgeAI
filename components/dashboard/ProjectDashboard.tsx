"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AiContentNoticeCard } from "@/components/dashboard/AiContentNoticeCard";
import { ProductionFlow } from "@/components/app/ProductionFlow";
import { AppMobileNav } from "@/components/dashboard/AppMobileNav";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { CharacterSheetCard } from "@/components/dashboard/CharacterSheetCard";
import { CreatorsMarketCheckCard } from "@/components/dashboard/CreatorsMarketCheckCard";
import { ExportPanel } from "@/components/dashboard/ExportPanel";
import { GenerationStudioCard } from "@/components/dashboard/GenerationStudioCard";
import { ProjectHeader } from "@/components/dashboard/ProjectHeader";
import { SlicedPreview } from "@/components/dashboard/SlicedPreview";
import { StickerConfigCard } from "@/components/dashboard/StickerConfigCard";
import { StampDirectionEditor } from "@/components/dashboard/StampDirectionEditor";
import { StampProductionCard } from "@/components/dashboard/StampProductionCard";
import { StickerSheetPreview } from "@/components/dashboard/StickerSheetPreview";
import { TextModeCard } from "@/components/dashboard/TextModeCard";
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
  mockCharacterDesignDraft,
  mockCheckResults,
  mockProject,
  mockStickerDirections,
} from "@/lib/mock-data";
import { recentProjects } from "@/lib/operational-data";
import {
  createProjectId,
  findStoredProjectDraft,
  getStatusLabel,
  saveProjectDraft,
} from "@/lib/project-drafts";
import { createStickerDirectionsFromTheme } from "@/lib/stamp-theme-planner";
import { createStickerPreviewItems } from "@/lib/sticker-grid";
import type {
  CharacterDesignDraft,
  Project,
  ProjectCreationDraft,
  ProjectStatus,
  ReferenceImageAsset,
  StickerCount,
  StickerDirection,
  TextMode,
} from "@/lib/types";

type DialogState = "regenerate" | "text" | "phrase" | "aiNotice" | "rename" | "memo" | null;

type ProjectDashboardProps = {
  projectId?: string;
  mode?: "character" | "stamps";
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

function normalizeRouteProjectId(projectId?: string) {
  if (!projectId || projectId === "demo") {
    return mockProject.id;
  }

  try {
    return decodeURIComponent(projectId);
  } catch {
    return projectId;
  }
}

function getInitialProject(projectId?: string): Project {
  const normalizedId = normalizeRouteProjectId(projectId);
  const recentProject = recentProjects.find((project) => project.id === normalizedId);
  const isDemoProject = normalizedId === mockProject.id;

  return {
    ...mockProject,
    id: normalizedId,
    name: recentProject?.name ?? (isDemoProject ? mockProject.name : normalizedId),
    status: recentProject?.statusLabel
      ? statusFromLabel(recentProject.statusLabel)
      : isDemoProject
        ? mockProject.status
        : "draft",
    stickerCount: recentProject?.stickerCount ?? mockProject.stickerCount,
  };
}

function hasInitialGeneratedAssets(projectId?: string) {
  const normalizedId = normalizeRouteProjectId(projectId);
  return normalizedId === mockProject.id;
}

function getArtStyleFromStoredStyle(style: string) {
  return style.split(" / ")[0]?.trim() || mockCharacterDesignDraft.artStyle;
}

function getLineWeightFromStoredStyle(style: string) {
  return style.match(/線の太さ:\s*([^/]+)/)?.[1]?.trim() || mockCharacterDesignDraft.lineWeight;
}

function getReferenceImagesFromDraft(draft: ProjectCreationDraft): ReferenceImageAsset[] {
  if (draft.referenceImages?.length) {
    return draft.referenceImages.slice(0, 3);
  }

  if (draft.referenceImageName && draft.referenceImageUrl) {
    return [
      {
        name: draft.referenceImageName,
        url: draft.referenceImageUrl,
        mimeType: draft.referenceImageMimeType ?? "image/png",
        sizeBytes: draft.referenceImageSizeBytes,
      },
    ];
  }

  return [];
}

function createCharacterDesignFromDraft(draft: ProjectCreationDraft): CharacterDesignDraft {
  const referenceImages = getReferenceImagesFromDraft(draft);
  const primaryReferenceImage = referenceImages[0];

  return {
    characterType: draft.characterType,
    description: draft.characterDescription ?? draft.description.ja,
    referenceImages,
    referenceImageName: primaryReferenceImage?.name,
    referenceImageUrl: primaryReferenceImage?.url,
    referenceImageMimeType: primaryReferenceImage?.mimeType,
    referenceImageSizeBytes: primaryReferenceImage?.sizeBytes,
    artStyle: getArtStyleFromStoredStyle(draft.style),
    lineWeight: getLineWeightFromStoredStyle(draft.style),
    colorTheme: draft.colorTheme,
    costumeAndProps: draft.costumeAndProps,
    personality: draft.personality,
    mustKeepFeatures: draft.mustKeepFeatures ?? mockCharacterDesignDraft.mustKeepFeatures,
  };
}

export function ProjectDashboard({ projectId, mode = "character" }: ProjectDashboardProps) {
  const router = useRouter();
  const resolvedProjectId = projectId ?? "demo";
  const [project, setProject] = useState<Project>(() => getInitialProject(resolvedProjectId));
  const [stickerCount, setStickerCount] = useState<StickerCount>(() => getInitialProject(resolvedProjectId).stickerCount);
  const [textMode, setTextMode] = useState<TextMode>(mockProject.textMode);
  const [characterDesign, setCharacterDesign] = useState<CharacterDesignDraft>(mockCharacterDesignDraft);
  const [isCharacterApproved, setIsCharacterApproved] = useState(() => hasInitialGeneratedAssets(resolvedProjectId));
  const [isStampApproved, setIsStampApproved] = useState(() => hasInitialGeneratedAssets(resolvedProjectId));
  const [characterAssetsReady, setCharacterAssetsReady] = useState(() => hasInitialGeneratedAssets(resolvedProjectId));
  const [stampAssetsReady, setStampAssetsReady] = useState(() => hasInitialGeneratedAssets(resolvedProjectId));
  const [stickerDirections, setStickerDirections] = useState<StickerDirection[]>(mockStickerDirections);
  const [stampTheme, setStampTheme] = useState("");
  const [aiDirectionPlanReady, setAiDirectionPlanReady] = useState(() => hasInitialGeneratedAssets(resolvedProjectId));
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>(
    phraseTemplateTexts.slice(0, getInitialProject(resolvedProjectId).stickerCount)
  );
  const [assetVersion, setAssetVersion] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogInput, setDialogInput] = useState("");
  const characterEditorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const normalizedId = normalizeRouteProjectId(resolvedProjectId);
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
      setCharacterDesign(createCharacterDesignFromDraft(storedProject));
      setStampTheme("");
      setAiDirectionPlanReady(false);
      setCharacterAssetsReady(false);
      setStampAssetsReady(false);
      setIsCharacterApproved(false);
      setIsStampApproved(false);
      return;
    }

    const initialProject = getInitialProject(resolvedProjectId);
    const initialAssetsReady = hasInitialGeneratedAssets(resolvedProjectId);
    setProject(initialProject);
    setStickerCount(initialProject.stickerCount);
    setTextMode(initialProject.textMode);
    setSelectedPhrases(phraseTemplateTexts.slice(0, initialProject.stickerCount));
    setCharacterDesign(mockCharacterDesignDraft);
    setStampTheme("");
    setAiDirectionPlanReady(initialAssetsReady);
    setCharacterAssetsReady(initialAssetsReady);
    setStampAssetsReady(initialAssetsReady);
    setIsCharacterApproved(initialAssetsReady);
    setIsStampApproved(initialAssetsReady);
  }, [resolvedProjectId]);

  const currentProject = useMemo(
    () => ({
      ...project,
      stickerCount,
      textMode,
    }),
    [project, stickerCount, textMode]
  );

  const routeProjectId = resolvedProjectId === "demo" ? "demo" : currentProject.id;
  const characterSheetHref = `/app/projects/${encodeURIComponent(routeProjectId)}`;
  const stampHref = `${characterSheetHref}/stamps`;

  useEffect(() => {
    if (mode !== "character" || typeof window === "undefined") {
      return;
    }

    if (["#stamps", "#sticker-set", "#export", "#checks"].includes(window.location.hash)) {
      router.replace(stampHref);
    }
  }, [mode, router, stampHref]);

  const previewItems = useMemo(
    () => createStickerPreviewItems(stickerDirections, stickerCount),
    [stickerCount, stickerDirections]
  );

  const updateProjectStatus = useCallback((status: ProjectStatus) => {
    setProject((current) => {
      if (current.status === status) {
        return current;
      }

      return { ...current, status };
    });

    const storedProject = findStoredProjectDraft(project.id);
    if (storedProject && storedProject.status !== status) {
      saveProjectDraft({
        ...storedProject,
        status,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [project.id]);

  const handleCharacterAssetsUpdated = useCallback(() => {
    setAssetVersion(String(Date.now()));
    setCharacterAssetsReady(true);
    setIsCharacterApproved(false);
    setStampAssetsReady(false);
    setIsStampApproved(false);
    updateProjectStatus("review_ready");
  }, [updateProjectStatus]);

  const handleStampAssetsUpdated = useCallback(() => {
    setAssetVersion(String(Date.now()));
    setCharacterAssetsReady(true);
    setIsCharacterApproved(true);
    setStampAssetsReady(true);
    setIsStampApproved(false);
    updateProjectStatus("review_ready");
  }, [updateProjectStatus]);

  const handleCharacterReadyFromJobs = useCallback(() => {
    setCharacterAssetsReady(true);
    setIsCharacterApproved(true);
    updateProjectStatus("review_ready");
  }, [updateProjectStatus]);

  const handleCharacterFeedbackSubmit = useCallback(
    async (feedback: string) => {
      if (!characterAssetsReady) {
        toast.error("先にキャラクターシートを生成してください");
        return;
      }

      const response = await fetch("/api/generation-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProject.id,
          type: "generate-character-sheet",
          input: {
            projectId: currentProject.id,
            characterType: characterDesign.characterType,
            style: `${characterDesign.artStyle} / 線の太さ: ${characterDesign.lineWeight}`,
            colorTheme: characterDesign.colorTheme,
            costumeAndProps: characterDesign.costumeAndProps,
            personality: `${characterDesign.description} ${characterDesign.personality}`,
            mustKeepFeatures: [
              characterDesign.mustKeepFeatures,
              `既存生成結果へのフィードバック: ${feedback}`,
              "前回の良い部分は残し、指摘された箇所だけを優先的に修正する。",
            ].join(" "),
            referenceImages: characterDesign.referenceImages,
            referenceImageName: characterDesign.referenceImageName,
            referenceImageUrl: characterDesign.referenceImageUrl,
            referenceImageMimeType: characterDesign.referenceImageMimeType,
            referenceImageSizeBytes: characterDesign.referenceImageSizeBytes,
          },
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        toast.error(body?.error ?? "AI修正ジョブの作成に失敗しました");
        return;
      }

      setCharacterAssetsReady(false);
      setStampAssetsReady(false);
      setIsCharacterApproved(false);
      setIsStampApproved(false);
      updateProjectStatus("generating");
      toast.success("キャラクターシートのAI修正を開始しました");
    },
    [characterAssetsReady, characterDesign, currentProject.id, updateProjectStatus]
  );

  const handleCharacterManualUpload = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("assetType", "character-sheet");
      formData.append("projectId", currentProject.id);
      formData.append("file", file);

      const response = await fetch("/api/generated-assets", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        toast.error(body?.error ?? "キャラクターシートの差し替えに失敗しました");
        return;
      }

      setAssetVersion(String(Date.now()));
      setCharacterAssetsReady(true);
      setStampAssetsReady(false);
      setIsCharacterApproved(false);
      setIsStampApproved(false);
      updateProjectStatus("review_ready");
      toast.success("キャラクターシートを手動差し替えしました");
    },
    [currentProject.id, updateProjectStatus]
  );

  const handleGenerationStateChange = useCallback(
    (state: "generating" | "succeeded" | "failed") => {
      if (state === "generating") {
        updateProjectStatus("generating");
      }

      if (state === "succeeded") {
        updateProjectStatus("review_ready");
      }

      if (state === "failed") {
        updateProjectStatus("draft");
      }
    },
    [updateProjectStatus]
  );

  const handleStickerDirectionChange = (id: number, patch: Partial<StickerDirection>) => {
    setStickerDirections((current) =>
      current.map((direction) => (direction.id === id ? { ...direction, ...patch } : direction))
    );
    setAiDirectionPlanReady(true);
    setStampAssetsReady(false);
    setIsStampApproved(false);
  };

  const handleGenerateAiDirectionPlan = () => {
    const theme = stampTheme.trim();

    if (!theme) {
      toast.error("先にスタンプシートのテーマを入力してください");
      return;
    }

    const nextDirections = createStickerDirectionsFromTheme({
      theme,
      stickerCount,
      currentDirections: stickerDirections,
    });

    setStickerDirections((current) => [
      ...nextDirections,
      ...current.slice(stickerCount),
    ]);
    setSelectedPhrases(nextDirections.map((direction) => direction.text));
    setAiDirectionPlanReady(true);
    setStampAssetsReady(false);
    setIsStampApproved(false);
    toast.success("AI設計案を反映しました");
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

      toast.success("キャラクターシート名を更新しました");
    }

    if (dialog === "memo") {
      toast.success("制作メモを保存しました");
    }

    if (dialog === "phrase" && dialogInput.trim()) {
      const nextText = dialogInput.trim();
      const nextId = Math.max(...stickerDirections.map((direction) => direction.id)) + 1;
      setSelectedPhrases((current) => [...current, nextText]);
      setStickerDirections((current) => [
        ...current,
        {
          id: nextId,
          text: nextText,
          emotion: "通常",
          pose: "手を振る",
          prop: "✨",
          textColor: "#111111",
          speechShape: "白縁文字",
          speechStyle: "太字ポップ",
          characterMotion: "手を振る",
          directionNote: "セリフが読みやすく、日常会話で自然に使える表情。",
        },
      ]);
      setStampAssetsReady(false);
      setIsStampApproved(false);
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
      description: "修正したいコマ番号と内容を入力してください。生成ジョブとして順番に処理します。",
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
      title: "キャラクターシート名を編集",
      description: "一覧、申請パック、編集画面で使うキャラクターシート名を更新します。",
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
  const sidebarProjectId = resolvedProjectId === "demo" ? "demo" : currentProject.id;

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
      characterType: characterDesign.characterType,
      referenceImages: characterDesign.referenceImages,
      referenceImageName: characterDesign.referenceImageName,
      referenceImageUrl: characterDesign.referenceImageUrl,
      referenceImageMimeType: characterDesign.referenceImageMimeType,
      referenceImageSizeBytes: characterDesign.referenceImageSizeBytes,
      style: `${characterDesign.artStyle} / 線の太さ: ${characterDesign.lineWeight}`,
      colorTheme: characterDesign.colorTheme,
      costumeAndProps: characterDesign.costumeAndProps,
      characterDescription: characterDesign.description,
      mustKeepFeatures: characterDesign.mustKeepFeatures,
      personality: characterDesign.personality,
      usageScene: "既存キャラクターシートを複製して、セリフや構成を調整する制作フロー",
      title: {
        ja: duplicateName,
      },
      description: {
        ja: "複製したキャラクターシートです。Creators Market向けの説明文を編集してから書き出してください。",
      },
      creatorName: project.studioName,
      copyright: `© ${project.studioName}`,
      containsAiGeneratedContent: true,
      phrases: selectedPhrases.slice(0, stickerCount),
      createdAt: now,
      updatedAt: now,
    };

    saveProjectDraft(draft);
    toast.success("キャラクターシートを複製しました");
    router.push(`/app/projects/${encodeURIComponent(draft.id)}`);
  };

  const copyPreviewUrl = () => {
    if (typeof window === "undefined") {
      return;
    }

    const url = `${window.location.origin}/app/projects/${encodeURIComponent(project.id)}`;
    void window.navigator.clipboard.writeText(url).then(
      () => toast.success("プレビューURLをコピーしました"),
      () => toast.error("クリップボードへコピーできませんでした")
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="flex">
        <AppSidebar active="キャラクターシート" projectId={sidebarProjectId} />
        <div className="min-w-0 flex-1">
          <ProjectHeader
            characterSheetHref={characterSheetHref}
            mode={mode}
            projectName={project.name}
            stampHref={stampHref}
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
          <AppMobileNav active="キャラクターシート" projectId={sidebarProjectId} />

          <div className="px-5 py-6 xl:px-8">
            {mode === "character" ? (
              <main className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)]">
                <section className="flex min-w-0 flex-col gap-5">
                  <ProductionFlow variant="new-character" />
                  <div ref={characterEditorRef}>
                    <GenerationStudioCard
                      characterDesign={characterDesign}
                      isApproved={isCharacterApproved}
                      onApprove={() => {
                        if (!characterAssetsReady) {
                          toast.error("先にキャラクターシートを生成してください");
                          return;
                        }

                        setIsCharacterApproved(true);
                        toast.success("キャラクターデザインを承認しました");
                        router.push(stampHref);
                      }}
                      onAssetsUpdated={handleCharacterAssetsUpdated}
                      onGenerationStateChange={handleGenerationStateChange}
                      onChange={(nextDesign) => {
                        setCharacterDesign(nextDesign);
                        setCharacterAssetsReady(false);
                        setStampAssetsReady(false);
                        setIsCharacterApproved(false);
                        setIsStampApproved(false);
                        updateProjectStatus("draft");
                      }}
                      assetsReady={characterAssetsReady}
                      project={currentProject}
                    />
                  </div>
                </section>

                <aside
                  className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-28 xl:self-start"
                  id="character-sheet"
                >
                  <CharacterSheetCard
                    assetVersion={assetVersion}
                    assetsReady={characterAssetsReady}
                    onFeedbackSubmit={handleCharacterFeedbackSubmit}
                    onFocusEditor={() =>
                      characterEditorRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                    }
                    onManualUpload={handleCharacterManualUpload}
                    projectId={currentProject.id}
                  />
                </aside>
              </main>
            ) : (
              <main className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(460px,0.9fr)]">
                <section className="flex min-w-0 flex-col gap-5" id="stamps">
                  <ProductionFlow variant="stamp-production" />
                  <div className="grid gap-5 2xl:grid-cols-[0.95fr_1.3fr]">
                    <StickerConfigCard
                      value={stickerCount}
                      onChange={(nextCount) => {
                        setStickerCount(nextCount);
                        setAiDirectionPlanReady(false);
                        setStampAssetsReady(false);
                        setIsStampApproved(false);
                      }}
                    />
                    <TextModeCard
                      value={textMode}
                      onChange={(nextMode) => {
                        setTextMode(nextMode);
                        setStampAssetsReady(false);
                        setIsStampApproved(false);
                      }}
                    />
                  </div>
                  <StampDirectionEditor
                    aiPlanReady={aiDirectionPlanReady}
                    directions={stickerDirections}
                    onChange={handleStickerDirectionChange}
                    onGenerateAiPlan={handleGenerateAiDirectionPlan}
                    onStampThemeChange={(nextTheme) => {
                      setStampTheme(nextTheme);
                      setAiDirectionPlanReady(false);
                    }}
                    stampTheme={stampTheme}
                    stickerCount={stickerCount}
                  />
                  <StampProductionCard
                    aiPlanReady={aiDirectionPlanReady}
                    characterApproved={isCharacterApproved}
                    directions={stickerDirections}
                    onApprove={() => {
                      if (!stampAssetsReady) {
                        toast.error("先にスタンプシートを生成してください");
                        return;
                      }

                      setIsStampApproved(true);
                      toast.success("スタンプセットを承認しました");
                    }}
                    onAssetsUpdated={handleStampAssetsUpdated}
                    onCharacterReady={handleCharacterReadyFromJobs}
                    characterAssetsReady={characterAssetsReady}
                    project={currentProject}
                    stampApproved={isStampApproved}
                    stampAssetsReady={stampAssetsReady}
                    stickerCount={stickerCount}
                    textMode={textMode}
                  />
                  <CreatorsMarketCheckCard checks={mockCheckResults} />
                  <AiContentNoticeCard onDetailsClick={() => setDialog("aiNotice")} />
                </section>

                <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-28 xl:self-start">
                  <StickerSheetPreview
                    assetVersion={assetVersion}
                    assetsReady={stampAssetsReady}
                    items={previewItems}
                    projectId={currentProject.id}
                    stickerCount={stickerCount}
                    textMode={textMode}
                  />
                  <SlicedPreview
                    assetVersion={assetVersion}
                    assetsReady={stampAssetsReady}
                    items={previewItems}
                    projectId={currentProject.id}
                    stickerCount={stickerCount}
                  />
                  <ExportPanel
                    assetsReady={stampAssetsReady}
                    checks={mockCheckResults}
                    phrases={stickerDirections}
                    project={currentProject}
                  />
                </aside>
              </main>
            )}
          </div>
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
