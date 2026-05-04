import type { Metadata } from "next";

import { InfoPage } from "@/components/site/InfoPage";
import { MarketingShell } from "@/components/site/MarketingShell";

export const metadata: Metadata = {
  title: "運営会社 | StampForge AI",
  description: "StampForge AIの運営情報。",
};

export default function CompanyPage() {
  return (
    <MarketingShell>
      <InfoPage
        description="MVPでは仮の運営名義を置き、正式提供時に法人情報へ差し替える前提です。"
        eyebrow="Company"
        title="運営会社"
        sections={[
          {
            title: "運営者",
            body: ["Magic Rabbit Studio（仮）"],
          },
          {
            title: "事業内容",
            items: [
              "キャラクターシート起点のスタンプ制作支援",
              "Creators Market向けファイルチェック支援",
              "AI生成コンテンツの制作ワークフロー設計",
              "法人・商用レビュー相談",
            ],
          },
          {
            title: "連絡先",
            body: ["お問い合わせフォームからご連絡ください。正式提供時には所在地、責任者、連絡先を明示します。"],
          },
        ]}
      />
    </MarketingShell>
  );
}
