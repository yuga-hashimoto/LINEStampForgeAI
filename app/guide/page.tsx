import type { Metadata } from "next";

import { InfoPage } from "@/components/site/InfoPage";
import { MarketingShell } from "@/components/site/MarketingShell";

export const metadata: Metadata = {
  title: "使い方ガイド | StampForge AI",
  description: "StampForge AIでスタンプセットを書き出すまでの手順。",
};

export default function GuidePage() {
  return (
    <MarketingShell>
      <InfoPage
        action={{ label: "制作ダッシュボードを開く", href: "/app/projects/demo" }}
        description="企画入力からZIP書き出しまで、初回制作で迷わないための基本手順です。"
        eyebrow="Guide"
        title="6ステップでスタンプセットを作る"
        sections={[
          {
            title: "1. 企画入力",
            body: ["キャラクター種別、性格、衣装、小物、維持したい特徴、販売想定を入力します。"],
          },
          {
            title: "2. キャラクターシート生成",
            body: ["文字なしの参照画像を作り、顔、体型、色、衣装、小物の一貫性を固めます。"],
          },
          {
            title: "3. スタンプセット生成",
            body: ["8 / 16 / 24 / 32 / 40個から選び、セリフと文字モードを決めます。"],
          },
          {
            title: "4. 自動切り出し",
            body: ["シートから各スタンプを切り出し、透過背景と偶数pxを前提に確認します。"],
          },
          {
            title: "5. ルールチェック",
            body: ["サイズ、容量、余白、視認性、広告表現、AI生成コンテンツ表記を確認します。"],
          },
          {
            title: "6. ZIP書き出し",
            body: ["Creators Market用ZIPとして、スタンプ画像、メイン画像、タブ画像、manifestをまとめます。"],
          },
        ]}
      />
    </MarketingShell>
  );
}
