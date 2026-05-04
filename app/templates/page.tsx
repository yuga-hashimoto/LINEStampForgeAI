import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { MarketingShell } from "@/components/site/MarketingShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { templateSets } from "@/lib/operational-data";

export const metadata: Metadata = {
  title: "テンプレート | StampForge AI",
  description: "日常会話、仕事連絡、気遣い、販売前フルセットのセリフテンプレート。",
};

export default function TemplatesPage() {
  return (
    <MarketingShell>
      <section className="bg-zinc-50 py-12">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <p className="text-sm font-black line-green">Templates</p>
          <h1 className="mt-3 text-4xl font-black text-zinc-950">セリフテンプレート</h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-8 text-zinc-700">
            日常会話で使いやすい構成を起点に、キャラクターの性格に合わせて編集できます。
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {templateSets.map((template) => (
              <Card className="rounded-xl bg-white shadow-sm" key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl font-black">{template.name}</CardTitle>
                      <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700" variant="secondary">
                      {template.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {template.phrases.map((phrase) => (
                      <span
                        className="rounded-full border bg-zinc-50 px-3 py-1.5 text-sm font-bold"
                        key={phrase}
                      >
                        {phrase}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button asChild className="mt-8 line-bg">
            <Link href="/app/templates">
              アプリでテンプレートを使う
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
