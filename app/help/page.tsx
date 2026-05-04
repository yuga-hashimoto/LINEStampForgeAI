import Link from "next/link";
import type { Metadata } from "next";
import { LifeBuoy } from "lucide-react";

import { InfoPage } from "@/components/site/InfoPage";
import { MarketingShell } from "@/components/site/MarketingShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { helpFaqs } from "@/lib/operational-data";

export const metadata: Metadata = {
  title: "ヘルプセンター | StampForge AI",
  description: "StampForge AIのよくある質問とサポート導線です。",
};

export default function HelpPage() {
  return (
    <MarketingShell>
      <InfoPage
        action={{ label: "問い合わせる", href: "/contact" }}
        aside={
          <Card className="rounded-xl bg-white shadow-sm">
            <CardContent className="p-6">
              <LifeBuoy className="line-green" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-black text-zinc-950">サポート</h2>
              <p className="mt-3 text-sm font-medium leading-7 text-muted-foreground">
                制作代行、店舗利用、法人レビューが必要な場合は問い合わせフォームからご連絡ください。
              </p>
              <Button asChild className="mt-5 w-full line-bg">
                <Link href="/contact">お問い合わせ</Link>
              </Button>
            </CardContent>
          </Card>
        }
        description="制作フロー、チェック項目、AI生成コンテンツ、料金上限についての基本FAQです。"
        eyebrow="Help"
        title="ヘルプセンター"
        sections={helpFaqs.map((faq) => ({
          title: faq.question,
          body: [faq.answer],
        }))}
      />
    </MarketingShell>
  );
}
