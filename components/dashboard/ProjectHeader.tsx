import { Edit3, MoreVertical, RefreshCw, ScanLine, Type } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProjectHeaderProps = {
  projectName: string;
  statusLabel: string;
  onActionDialog: (action: "regenerate" | "text") => void;
  onRenameProject: () => void;
  onOptimizePadding: () => void;
  onDuplicateProject: () => void;
  onCopyPreviewUrl: () => void;
  onOpenMemo: () => void;
};

export function ProjectHeader({
  projectName,
  statusLabel,
  onActionDialog,
  onRenameProject,
  onOptimizePadding,
  onDuplicateProject,
  onCopyPreviewUrl,
  onOpenMemo,
}: ProjectHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-white/94 backdrop-blur">
      <div className="flex min-h-22 flex-col gap-4 px-5 py-4 xl:flex-row xl:items-center xl:justify-between xl:px-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-2xl font-black text-zinc-950">{projectName}</h1>
            <button
              className="rounded-md p-1 text-muted-foreground hover:bg-zinc-100"
              onClick={onRenameProject}
              type="button"
            >
              <Edit3 aria-hidden="true" />
              <span className="sr-only">キャラクターシート名を編集</span>
            </button>
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700" variant="outline">
              {statusLabel}
            </Badge>
            <Badge className="border-green-200 bg-green-50 text-green-700" variant="outline">
              LINE Creators Market向け
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => onActionDialog("regenerate")} variant="outline">
            <RefreshCw data-icon="inline-start" />
            特定コマを再生成
          </Button>
          <Button onClick={() => onActionDialog("text")} variant="outline">
            <Type data-icon="inline-start" />
            文字だけ修正
          </Button>
          <Button onClick={onOptimizePadding} variant="outline">
            <ScanLine data-icon="inline-start" />
            余白を最適化
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline">
                <MoreVertical />
                <span className="sr-only">その他の操作</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={onDuplicateProject}>キャラクターシートを複製</DropdownMenuItem>
                <DropdownMenuItem onSelect={onCopyPreviewUrl}>プレビューURLをコピー</DropdownMenuItem>
                <DropdownMenuItem onSelect={onOpenMemo}>制作メモを開く</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
