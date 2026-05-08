"use client";

import {
  characterMotionOptions,
  speechColorOptions,
  speechShapeOptions,
  speechStyleOptions,
} from "@/lib/constants";
import type { StickerCount, StickerDirection } from "@/lib/types";

type StampDirectionEditorProps = {
  stickerCount: StickerCount;
  directions: StickerDirection[];
  stampTheme: string;
  aiPlanReady: boolean;
  onChange: (id: number, patch: Partial<StickerDirection>) => void;
  onGenerateAiPlan: () => void;
  onStampThemeChange: (value: string) => void;
};

export function StampDirectionEditor({
  stickerCount,
  directions,
  stampTheme = "",
  aiPlanReady = false,
  onChange,
  onGenerateAiPlan,
  onStampThemeChange,
}: StampDirectionEditorProps) {
  const visibleDirections = directions.slice(0, stickerCount);
  const canGenerateAiPlan = stampTheme.trim().length > 0;

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b p-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-black text-zinc-950">テーマからAI設計案を作る</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
            最初はAIにセリフ、文字、動きを考えさせます。提案を確認してから、必要な箇所だけ1コマごとに微修正します。
          </p>
        </div>
        <p className="rounded-full border bg-green-50 px-3 py-1 text-xs font-black text-green-700">
          {visibleDirections.length}件
        </p>
      </div>

      <div className="grid gap-4 border-b bg-zinc-50 p-4">
        <label className="grid gap-2 text-sm font-black text-zinc-800">
          スタンプシートのテーマ
          <textarea
            className="min-h-24 rounded-xl border bg-white px-3 py-3 text-sm font-semibold leading-6 text-zinc-700 outline-none focus-visible:border-green-400 focus-visible:ring-4 focus-visible:ring-green-100"
            onChange={(event) => onStampThemeChange(event.target.value)}
            placeholder="例: 友だちとの日常会話で使いやすい、ゆるいぶうにゃんスタンプ。あいさつ、感謝、確認、応援を中心にしたい。"
            value={stampTheme}
          />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold leading-5 text-muted-foreground">
            AIはテーマからセリフ、文字色、文字の形、文字スタイル、キャラクターの動きをまとめて提案します。
          </p>
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#06C755] px-5 text-sm font-black text-white transition hover:bg-[#00B900] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
            disabled={!canGenerateAiPlan}
            onClick={onGenerateAiPlan}
            type="button"
          >
            AIに考えさせる
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {["日常会話", "店舗・接客", "家族連絡", "仕事連絡", "推し活・応援"].map((preset) => (
            <button
              className="rounded-full border bg-white px-3 py-1 text-xs font-black text-zinc-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
              key={preset}
              onClick={() => onStampThemeChange(preset)}
              type="button"
            >
              {preset}
            </button>
          ))}
        </div>
        {aiPlanReady ? (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-black text-green-700">
            AI設計案を反映済みです。問題なければスタンプ生成へ進めます。
          </p>
        ) : null}
      </div>

      {!aiPlanReady ? (
        <div className="p-5">
          <div className="rounded-xl border border-dashed bg-white p-5 text-center">
            <p className="text-base font-black text-zinc-900">まずテーマからAI設計案を作成します</p>
            <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-muted-foreground">
              セリフ、文字色、文字の形、文字スタイル、キャラクターの動きはAI案を出してから必要な箇所だけ修正できます。
            </p>
          </div>
        </div>
      ) : (
        <div className="max-h-[620px] overflow-auto p-4">
          <div className="grid min-w-[980px] gap-2">
            <div className="grid grid-cols-[52px_1.2fr_1fr_0.8fr_1fr_1fr_1.4fr] gap-2 px-2 text-xs font-black text-zinc-500">
              <span>No.</span>
              <span>セリフ</span>
              <span>キャラの動き</span>
              <span>文字色</span>
              <span>形</span>
              <span>スタイル</span>
              <span>補足</span>
            </div>
            {visibleDirections.map((direction) => (
              <div
                className="grid grid-cols-[52px_1.2fr_1fr_0.8fr_1fr_1fr_1.4fr] gap-2 rounded-xl border bg-zinc-50 p-2"
                key={direction.id}
              >
                <div className="flex items-center justify-center rounded-lg bg-white text-sm font-black text-green-700">
                  {String(direction.id).padStart(2, "0")}
                </div>
                <input
                  className="min-h-10 rounded-lg border bg-white px-3 text-sm font-bold outline-none focus-visible:border-green-400 focus-visible:ring-4 focus-visible:ring-green-100"
                  onChange={(event) => onChange(direction.id, { text: event.target.value })}
                  value={direction.text}
                />
                <select
                  className="min-h-10 rounded-lg border bg-white px-3 text-sm font-bold outline-none focus-visible:border-green-400 focus-visible:ring-4 focus-visible:ring-green-100"
                  onChange={(event) => onChange(direction.id, { characterMotion: event.target.value })}
                  value={direction.characterMotion}
                >
                  {[direction.characterMotion, ...characterMotionOptions]
                    .filter((value, index, values) => values.indexOf(value) === index)
                    .map((motion) => (
                      <option key={motion} value={motion}>
                        {motion}
                      </option>
                    ))}
                </select>
                <select
                  className="min-h-10 rounded-lg border bg-white px-3 text-sm font-bold outline-none focus-visible:border-green-400 focus-visible:ring-4 focus-visible:ring-green-100"
                  onChange={(event) => onChange(direction.id, { textColor: event.target.value })}
                  value={direction.textColor}
                >
                  {speechColorOptions.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.label}
                    </option>
                  ))}
                </select>
                <select
                  className="min-h-10 rounded-lg border bg-white px-3 text-sm font-bold outline-none focus-visible:border-green-400 focus-visible:ring-4 focus-visible:ring-green-100"
                  onChange={(event) => onChange(direction.id, { speechShape: event.target.value })}
                  value={direction.speechShape}
                >
                  {speechShapeOptions.map((shape) => (
                    <option key={shape} value={shape}>
                      {shape}
                    </option>
                  ))}
                </select>
                <select
                  className="min-h-10 rounded-lg border bg-white px-3 text-sm font-bold outline-none focus-visible:border-green-400 focus-visible:ring-4 focus-visible:ring-green-100"
                  onChange={(event) => onChange(direction.id, { speechStyle: event.target.value })}
                  value={direction.speechStyle}
                >
                  {speechStyleOptions.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
                <input
                  className="min-h-10 rounded-lg border bg-white px-3 text-sm font-bold outline-none focus-visible:border-green-400 focus-visible:ring-4 focus-visible:ring-green-100"
                  onChange={(event) => onChange(direction.id, { directionNote: event.target.value })}
                  value={direction.directionNote}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
