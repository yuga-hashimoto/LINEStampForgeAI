import type { Metadata } from "next";

import { InfoPage } from "@/components/site/InfoPage";
import { MarketingShell } from "@/components/site/MarketingShell";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | StampForge AI",
  description: "StampForge AIの特定商取引法に基づく表記の雛形。",
};

export default function CommercialTransactionsPage() {
  return (
    <MarketingShell>
      <InfoPage
        description="正式販売前に必要な表示項目を、MVP上でも確認できるようにしています。"
        eyebrow="Legal"
        title="特定商取引法に基づく表記"
        sections={[
          {
            title: "販売事業者",
            body: ["Magic Rabbit Studio（仮）。正式提供時には法人名または事業者名へ差し替えます。"],
          },
          {
            title: "販売価格",
            body: [
              "単発売り: 980円、1,480円、2,480円、3,480円、4,980円。月額: 1,980円/月、4,980円/月、14,800円/月。",
            ],
          },
          {
            title: "商品代金以外の必要料金",
            body: ["インターネット接続料金、通信料金は利用者の負担となります。"],
          },
          {
            title: "役務の提供時期",
            body: ["決済完了後、対象プランの生成クレジットまたは書き出し枠を付与します。MVPでは実決済を行いません。"],
          },
          {
            title: "返品・キャンセル",
            body: ["デジタルコンテンツの性質上、生成開始後の返金は原則として受け付けない方針です。正式提供時に詳細を明示します。"],
          },
        ]}
      />
    </MarketingShell>
  );
}
