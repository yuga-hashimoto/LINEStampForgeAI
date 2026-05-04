import type { Metadata } from "next";

import { InfoPage } from "@/components/site/InfoPage";
import { MarketingShell } from "@/components/site/MarketingShell";

export const metadata: Metadata = {
  title: "利用規約 | StampForge AI",
  description: "StampForge AIの利用条件、禁止事項、AI生成コンテンツの扱いについて。",
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <InfoPage
        description="本規約は、キャラクターシート起点のスタンプ制作支援サービスを安全に利用するための条件をまとめたものです。"
        eyebrow="Terms"
        title="利用規約"
        sections={[
          {
            title: "サービスの位置づけ",
            body: [
              "StampForge AIは、LINE Creators Market向け静止画スタンプの制作を支援するSaaSです。本サービスはLINE公式サービス、公式提携サービス、公式認定サービスではありません。",
              "画面内のチェックやZIP書き出しは制作前確認を支援するものであり、審査通過や販売開始を保証するものではありません。",
            ],
          },
          {
            title: "禁止事項",
            items: [
              "広告目的のみのスタンプ制作",
              "企業ロゴだけで構成されたスタンプ制作",
              "個人情報、ID、連絡先提供を求める表現",
              "第三者の権利を侵害するキャラクターや表現",
              "公序良俗に反する内容、差別的・暴力的な内容",
              "公式提携や公式認定と誤認させる表現",
            ],
          },
          {
            title: "AI生成コンテンツ",
            body: [
              "本サービスで作成される画像、セリフ、構成案にはAI生成またはAI補助で作られたコンテンツが含まれる場合があります。",
              "販売画面や審査提出時にAI生成コンテンツとして扱われる可能性があります。必要な表示、権利確認、利用条件は利用者の責任で確認してください。",
            ],
          },
          {
            title: "料金と利用上限",
            body: [
              "単発売りプランには含まれる再生成回数があり、月額プランには月間書き出し数と生成クレジット数があります。各プランの上限は料金画面で明示します。",
              "Stripe接続環境ではCheckout Sessionsで決済を開始します。ローカル開発環境ではデモCheckoutにフォールバックします。正式提供時には購入条件、返金条件、解約条件を明示します。",
            ],
          },
        ]}
      />
    </MarketingShell>
  );
}
