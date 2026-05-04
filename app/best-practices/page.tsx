import type { Metadata } from "next";

import { InfoPage } from "@/components/site/InfoPage";
import { MarketingShell } from "@/components/site/MarketingShell";

export const metadata: Metadata = {
  title: "ベストプラクティス | StampForge AI",
  description: "スタンプ制作で失敗しにくい進め方とレビュー前チェック。",
};

export default function BestPracticesPage() {
  return (
    <MarketingShell>
      <InfoPage
        action={{ label: "デモで確認", href: "/demo" }}
        description="キャラクターの一貫性、文字の読みやすさ、審査前チェックを意識した制作順です。"
        eyebrow="Best Practices"
        title="レビュー前に品質を上げる"
        sections={[
          {
            title: "まずキャラクターシートを確定",
            body: [
              "性格、世界観、表情、ポーズ、色、衣装、小物を先に固めると、各コマが同じキャラクターとして見えやすくなります。",
            ],
          },
          {
            title: "16個か24個で検証",
            body: [
              "最初から40個へ広げず、日常会話で使いやすい短文を中心に小さく反応を確認します。",
            ],
          },
          {
            title: "文字は読みやすさ優先",
            body: [
              "黒文字と白縁、余白、見切れ防止を確認し、視認性が低い表現を避けます。",
            ],
          },
          {
            title: "広告表現を避ける",
            body: [
              "商品発売告知、企業ロゴのみ、連絡先やID提供を求める内容は避け、日常会話で使える表現に寄せます。",
            ],
          },
        ]}
      />
    </MarketingShell>
  );
}
