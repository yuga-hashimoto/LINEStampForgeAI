"use client";

import { useMemo, useState } from "react";
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
import { createStickerPreviewItems } from "@/lib/sticker-grid";
import type { StickerCount, TextMode } from "@/lib/types";

type DialogState = "regenerate" | "text" | "phrase" | "aiNotice" | null;

export function ProjectDashboard() {
  const [stickerCount, setStickerCount] = useState<StickerCount>(mockProject.stickerCount);
  const [textMode, setTextMode] = useState<TextMode>(mockProject.textMode);
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>(
    phraseTemplateTexts.slice(0, mockProject.stickerCount)
  );
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogInput, setDialogInput] = useState("");

  const currentProject = useMemo(
    () => ({
      ...mockProject,
      stickerCount,
      textMode,
    }),
    [stickerCount, textMode]
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
  } satisfies Record<Exclude<DialogState, null>, { title: string; description: string; placeholder: string; submit: string }>;

  const activeDialogCopy = dialog ? dialogCopy[dialog] : null;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="flex">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <ProjectHeader
            onActionDialog={(action) => setDialog(action)}
            onOptimizePadding={() => toast.success("余白を約10pxに最適化しました")}
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
              {dialog !== "aiNotice" ? (
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
