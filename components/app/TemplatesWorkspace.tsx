"use client";

import Link from "next/link";
import { ArrowRight, Copy, MessageSquareText } from "lucide-react";
import { toast } from "sonner";

import { AppFrame } from "@/components/app/AppFrame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { templateSets } from "@/lib/operational-data";

export function TemplatesWorkspace() {
  return (
    <AppFrame
      active="スタンプセット"
      action={
        <Button asChild className="line-bg">
          <Link href="/app/projects/demo">
            デモで使う
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      }
      description="用途別セリフセットを選び、24個・40個などの構成検討に使えます。"
      title="テンプレート"
    >
      <div className="grid gap-4 xl:grid-cols-2">
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
                  {template.stickerCount}個
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
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="line-bg"
                  onClick={() => toast.success(`${template.name}をデモシートへ適用しました`)}
                >
                  <MessageSquareText data-icon="inline-start" />
                  適用する
                </Button>
                <Button
                  onClick={() => toast.success("セリフ一覧をコピーしました")}
                  variant="outline"
                >
                  <Copy data-icon="inline-start" />
                  コピー
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppFrame>
  );
}
