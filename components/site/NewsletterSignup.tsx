"use client";

import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();

    if (!trimmed || !trimmed.includes("@")) {
      toast.error("有効なメールアドレスを入力してください");
      return;
    }

    toast.success("最新情報の登録を受け付けました");
    setEmail("");
  };

  return (
    <form className="mt-4 flex gap-3" onSubmit={handleSubmit}>
      <div className="relative min-w-0 flex-1">
        <Mail
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          className="pl-10"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="メールアドレスを入力"
          type="email"
          value={email}
        />
      </div>
      <Button className="line-bg" type="submit">
        登録する
      </Button>
    </form>
  );
}
