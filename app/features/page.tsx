import type { Metadata } from "next";

import { InfoPage } from "@/components/site/InfoPage";
import { MarketingShell } from "@/components/site/MarketingShell";

export const metadata: Metadata = {
  title: "機能 | StampForge AI",
  description: "キャラクターシート起点のLINEスタンプ制作SaaSの機能一覧。",
};

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <InfoPage
        action={{ label: "デモを見る", href: "/demo" }}
        description="単なる画像生成画面ではなく、スタンプ制作のパイプライン全体をUI化しています。"
        eyebrow="Features"
        title="制作パイプラインを一気通貫で管理"
        sections={[
          {
            title: "キャラクターシート起点",
            body: [
              "正面、斜め、横向き、後ろ、表情差分、カラーパレットを整理し、同じキャラクターでスタンプを展開しやすくします。",
            ],
          },
          {
            title: "スタンプセット生成",
            items: [
              "8 / 16 / 24 / 32 / 40個に対応",
              "AI文字、あと乗せ、ハイブリッドを選択",
              "セリフテンプレートを編集可能",
              "将来の画像生成API接続に備えたジョブ設計",
            ],
          },
          {
            title: "Creators Market向けチェック",
            items: [
              "PNG",
              "背景透過",
              "370×320以内",
              "メイン画像 240×240",
              "タブ画像 96×74",
              "ZIP 60MB以内",
              "余白 約10px",
              "日常会話向け",
            ],
          },
        ]}
      />
    </MarketingShell>
  );
}
