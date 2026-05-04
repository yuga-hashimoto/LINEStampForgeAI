"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ExternalLink, Save } from "lucide-react";
import { toast } from "sonner";

import { AppFrame } from "@/components/app/AppFrame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsWorkspace() {
  const [studioName, setStudioName] = useState("Magic Rabbit Studio");
  const [contactEmail, setContactEmail] = useState("demo@stampforge.local");
  const [aiNotice, setAiNotice] = useState(true);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studioName.trim() || !contactEmail.includes("@")) {
      toast.error("スタジオ名とメールアドレスを確認してください");
      return;
    }

    toast.success("設定を保存しました");
  };

  return (
    <AppFrame
      active="設定"
      description="スタジオ情報、AI生成コンテンツ表記、法務リンク、利用量を管理します。"
      title="設定"
    >
      <Tabs defaultValue="profile">
        <TabsList className="mb-6 h-11 rounded-xl bg-white p-1 shadow-sm">
          <TabsTrigger className="rounded-lg px-5 py-2 text-sm font-bold" value="profile">
            基本設定
          </TabsTrigger>
          <TabsTrigger className="rounded-lg px-5 py-2 text-sm font-bold" value="legal">
            法務・表記
          </TabsTrigger>
          <TabsTrigger className="rounded-lg px-5 py-2 text-sm font-bold" value="usage">
            利用量
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="rounded-xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-black">スタジオ情報</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
                  スタジオ名
                  <Input
                    onChange={(event) => setStudioName(event.target.value)}
                    value={studioName}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
                  連絡先メール
                  <Input
                    onChange={(event) => setContactEmail(event.target.value)}
                    type="email"
                    value={contactEmail}
                  />
                </label>
                <label className="flex items-start gap-3 rounded-xl border bg-zinc-50 p-4 text-sm font-medium leading-6 text-muted-foreground md:col-span-2">
                  <input
                    checked={aiNotice}
                    className="mt-1 size-4 accent-green-500"
                    onChange={(event) => setAiNotice(event.target.checked)}
                    type="checkbox"
                  />
                  <span>
                    書き出しmanifestにAI生成またはAI補助で作られたコンテンツを含む旨を残す。
                  </span>
                </label>
                <div className="md:col-span-2">
                  <Button className="line-bg" type="submit">
                    <Save data-icon="inline-start" />
                    保存する
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "利用規約", href: "/terms" },
              { label: "プライバシーポリシー", href: "/privacy" },
              { label: "特商法表記", href: "/legal/commercial-transactions" },
            ].map((link) => (
              <Card className="rounded-xl bg-white shadow-sm" key={link.href}>
                <CardContent className="flex min-h-36 flex-col justify-between p-5">
                  <p className="text-lg font-black text-zinc-950">{link.label}</p>
                  <Button asChild variant="outline">
                    <Link href={link.href}>
                      確認する
                      <ExternalLink data-icon="inline-end" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage">
          <Card className="rounded-xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-black">利用量</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border bg-zinc-50 p-5">
                <p className="text-sm font-bold text-muted-foreground">生成クレジット</p>
                <p className="mt-2 text-3xl font-black">12 / 20</p>
              </div>
              <div className="rounded-xl border bg-zinc-50 p-5">
                <p className="text-sm font-bold text-muted-foreground">セット書き出し</p>
                <p className="mt-2 text-3xl font-black">1 / 1</p>
              </div>
              <div className="rounded-xl border bg-zinc-50 p-5">
                <p className="text-sm font-bold text-muted-foreground">追加生成</p>
                <p className="mt-2 text-3xl font-black">0 / 10</p>
              </div>
              <Button asChild className="line-bg md:col-span-3">
                <Link href="/app/billing">プランと購入内容を見る</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppFrame>
  );
}
