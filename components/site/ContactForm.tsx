"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.includes("@") || message.trim().length < 10) {
      toast.error("お名前、メールアドレス、10文字以上のお問い合わせ内容を入力してください");
      return;
    }

    toast.success("お問い合わせを受け付けました。デモ環境では送信ログのみの扱いです");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-black">お問い合わせフォーム</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
            お名前
            <Input
              onChange={(event) => setName(event.target.value)}
              placeholder="山田 太郎"
              value={name}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
            メールアドレス
            <Input
              onChange={(event) => setEmail(event.target.value)}
              placeholder="creator@example.com"
              type="email"
              value={email}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
            お問い合わせ内容
            <textarea
              className="min-h-36 rounded-md border border-input bg-transparent px-3 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onChange={(event) => setMessage(event.target.value)}
              placeholder="プラン、商用レビュー、制作代行での利用などをご記入ください"
              value={message}
            />
          </label>
          <Button className="line-bg" type="submit">
            <Send data-icon="inline-start" />
            送信する
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
