import Link from "next/link";
import { CheckCircle2, CreditCard, FileText } from "lucide-react";

import { AppFrame } from "@/components/app/AppFrame";
import { CheckoutButton } from "@/components/app/CheckoutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const planFeatures = [
  "24個標準プラン購入済み",
  "含まれる再生成: 5回",
  "PNG / ZIP書き出し",
  "Creators Market自動チェック",
];

export function BillingWorkspace() {
  return (
    <AppFrame
      active="設定"
      description="単発売りと月額プランの利用状況を確認します。Stripe設定時はCheckout Sessionsへ接続します。"
      title="プランと利用量"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="rounded-xl bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-black">現在の購入内容</CardTitle>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                生成回数、書き出し数、クレジット数の上限を明記します。Stripe未設定のローカル環境ではデモCheckoutとして扱います。
              </p>
            </div>
            <Badge className="bg-green-100 text-green-700" variant="secondary">
              単発売り
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-green-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-black text-green-700">24個標準</p>
                  <p className="mt-2 text-4xl font-black text-zinc-950">2,480円</p>
                  <p className="mt-2 text-sm font-semibold text-muted-foreground">
                    販売前提の初回セットにちょうどよい構成。
                  </p>
                </div>
                <Button asChild className="line-bg">
                  <Link href="/#pricing">他のプランを見る</Link>
                </Button>
                <CheckoutButton className="line-bg" planId="standard-24">
                  Checkoutを開始
                </CheckoutButton>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {planFeatures.map((feature) => (
                <div className="flex items-start gap-2 text-sm font-semibold" key={feature}>
                  <CheckCircle2 className="mt-0.5 text-emerald-600" aria-hidden="true" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="rounded-xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <CreditCard className="line-green" aria-hidden="true" />
                決済接続方針
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium leading-7 text-muted-foreground">
                Stripe Checkout Sessionsで単発売りと月額プランを分けて接続します。Webhook受信後、購入内容に応じて利用量台帳を更新します。
              </p>
              <div className="mt-4 grid gap-2">
                <CheckoutButton className="line-bg" planId="creator-pro">
                  Creator Proを申し込む
                </CheckoutButton>
                <CheckoutButton planId="extra-10" variant="outline">
                  追加生成10回を購入
                </CheckoutButton>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <FileText className="line-green" aria-hidden="true" />
                請求・法務
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button asChild variant="outline">
                <Link href="/legal/commercial-transactions">特商法表記</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/terms">利用規約</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppFrame>
  );
}
