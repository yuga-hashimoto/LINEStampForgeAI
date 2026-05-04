import type { StickerCount, TextMode } from "@/lib/types";

export const stickerCounts: StickerCount[] = [8, 16, 24, 32, 40];

export const textModes: Array<{
  value: TextMode;
  label: string;
  description: string;
}> = [
  {
    value: "ai",
    label: "AIに書かせる",
    description: "AIがイラストと文字をまとめて生成",
  },
  {
    value: "overlay",
    label: "あと乗せ",
    description: "イラスト生成後に文字を合成",
  },
  {
    value: "hybrid",
    label: "ハイブリッド",
    description: "AI文字をベースに必要な箇所だけ修正",
  },
];

export const ruleChips = [
  { label: "8 / 16 / 24 / 32 / 40個対応", detail: "セット数" },
  { label: "スタンプ画像 最大370×320px", detail: "PNG" },
  { label: "メイン画像 240×240", detail: "正方形" },
  { label: "タブ画像 96×74", detail: "横長" },
  { label: "PNG / 背景透過", detail: "保存形式" },
  { label: "偶数pxのみ", detail: "サイズ" },
  { label: "1枚1MB以内", detail: "容量" },
  { label: "ZIP 60MB以内", detail: "書き出し" },
  { label: "余白 約10px", detail: "推奨" },
  { label: "日常会話向け推奨", detail: "審査観点" },
  { label: "広告目的NG", detail: "ガイド" },
  { label: "AI生成表示に対応", detail: "注意表示" },
];

export const bestPracticeCards = [
  {
    number: "01",
    title: "まずキャラクターシートを確定",
    description:
      "性格や世界観、表情・ポーズのバリエーションをしっかり固めると、魅力的なスタンプになります。",
  },
  {
    number: "02",
    title: "文字モードを選択",
    description:
      "AIに書かせる / あと乗せ / ハイブリッドから、用途に合う文字入れ方法を選べます。",
  },
  {
    number: "03",
    title: "まず16個か24個で検証",
    description:
      "小さく作って反応を確認。人気が出たら32個・40個での展開もスムーズです。",
  },
  {
    number: "04",
    title: "レビュー前に自動チェック",
    description:
      "サイズ、容量、背景透過、余白、視認性などを事前に確認できます。",
  },
];

export const phraseTemplateTexts = [
  "おはよう",
  "こんにちは",
  "こんばんは",
  "おやすみ",
  "ありがとう",
  "よろしく",
  "了解です",
  "OKです",
  "おつかれさま",
  "ごめんね",
  "大丈夫？",
  "いってきます",
  "いってらっしゃい",
  "ただいま",
  "おかえり",
  "おめでとう",
  "がんばって",
  "ファイト！",
  "助かります",
  "すごい！",
  "やったー！",
  "またね",
  "お願いします",
  "承知です",
];
