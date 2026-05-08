import {
  CheckCircle2,
  FileImage,
  Grid3X3,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type FlowStep = {
  label: string;
  detail: string;
  icon: LucideIcon;
  state: "done" | "active" | "next";
};

type ProductionFlowProps = {
  variant: "new-character" | "existing-character" | "stamp-production";
};

const flows: Record<ProductionFlowProps["variant"], FlowStep[]> = {
  "new-character": [
    {
      label: "キャラクターシート生成",
      detail: "テキスト、参照画像、絵柄から1枚の参照シートを作成",
      icon: FileImage,
      state: "active",
    },
    {
      label: "テーマ作成",
      detail: "用途を入力してAIがセリフと動きを設計",
      icon: MessageSquareText,
      state: "next",
    },
    {
      label: "スタンプ作成",
      detail: "承認済みシートを固定してセット生成とZIP化",
      icon: Grid3X3,
      state: "next",
    },
  ],
  "existing-character": [
    {
      label: "生成済みキャラクター選択",
      detail: "一覧から使うキャラクターシートを選択",
      icon: FileImage,
      state: "active",
    },
    {
      label: "テーマ作成",
      detail: "量産したい会話テーマや用途を指定",
      icon: MessageSquareText,
      state: "next",
    },
    {
      label: "スタンプ作成",
      detail: "AI案を確認して必要箇所だけ修正",
      icon: Grid3X3,
      state: "next",
    },
  ],
  "stamp-production": [
    {
      label: "キャラクター固定",
      detail: "承認済みシートをスタンプ生成に使用",
      icon: CheckCircle2,
      state: "done",
    },
    {
      label: "テーマ作成",
      detail: "AIがセリフ、文字、動きを提案",
      icon: MessageSquareText,
      state: "active",
    },
    {
      label: "スタンプ作成",
      detail: "生成後はAI修正または手動差し替え",
      icon: Grid3X3,
      state: "next",
    },
  ],
};

export function ProductionFlow({ variant }: ProductionFlowProps) {
  return (
    <section className="rounded-xl border bg-white px-3 py-3 shadow-sm">
      <div className="grid grid-cols-3 gap-2">
        {flows[variant].map((step, index) => (
          <div
            className={cn(
              "flex min-h-16 flex-col gap-1.5 rounded-xl border px-2.5 py-2.5 sm:px-3",
              step.state === "active" && "border-green-200 bg-green-50",
              step.state === "done" && "border-emerald-200 bg-emerald-50",
              step.state === "next" && "bg-zinc-50"
            )}
            key={step.label}
          >
            <div className="flex items-center gap-1.5">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-zinc-500">
                {index + 1}
              </span>
              <step.icon
                className={cn(
                  "hidden size-4 shrink-0 text-zinc-500 min-[420px]:block",
                  step.state === "active" && "text-green-700",
                  step.state === "done" && "text-emerald-700"
                )}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-[11px] font-black leading-4 text-zinc-950 sm:text-sm">
                {step.label}
              </h2>
              <p className="mt-0.5 hidden text-xs font-semibold leading-5 text-muted-foreground md:block">
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
