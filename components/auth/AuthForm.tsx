"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

const storageKey = "stampforge_session";

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("マジックラビット");
  const [email, setEmail] = useState("demo@stampforge.local");
  const [password, setPassword] = useState("demo-password");
  const [agreed, setAgreed] = useState(mode === "login");

  const isRegister = mode === "register";

  const saveSession = () => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        name: name.trim() || "マジックラビット",
        email: email.trim(),
        plan: "standard",
        createdAt: new Date().toISOString(),
      })
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.includes("@") || password.trim().length < 8) {
      toast.error("メールアドレスと8文字以上のパスワードを入力してください");
      return;
    }

    if (isRegister && !agreed) {
      toast.error("利用規約とプライバシーポリシーへの同意が必要です");
      return;
    }

    saveSession();
    toast.success(isRegister ? "アカウントを作成しました" : "ログインしました");
    startTransition(() => router.push("/app"));
  };

  const continueDemo = () => {
    saveSession();
    toast.success("デモアカウントで開始します");
    startTransition(() => router.push("/app/projects/demo"));
  };

  return (
    <Card className="rounded-2xl bg-white shadow-xl shadow-zinc-950/5">
      <CardHeader className="gap-2">
        <CardTitle className="text-3xl font-black">
          {isRegister ? "無料で試す" : "ログイン"}
        </CardTitle>
        <p className="text-sm font-medium leading-6 text-muted-foreground">
          {isRegister
            ? "Clerk未設定の開発環境では、ローカルのデモセッションで制作ダッシュボードを確認できます。"
            : "Clerk未設定の開発環境では、下のデモボタンで制作画面へ進めます。"}
        </p>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {isRegister ? (
            <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
              表示名
              <Input
                onChange={(event) => setName(event.target.value)}
                placeholder="マジックラビット"
                value={name}
              />
            </label>
          ) : null}
          <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
            メールアドレス
            <Input
              onChange={(event) => setEmail(event.target.value)}
              placeholder="demo@stampforge.local"
              type="email"
              value={email}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold text-zinc-700">
            パスワード
            <Input
              onChange={(event) => setPassword(event.target.value)}
              placeholder="8文字以上"
              type="password"
              value={password}
            />
          </label>

          {isRegister ? (
            <label className="flex items-start gap-3 rounded-xl border bg-zinc-50 p-3 text-sm font-medium leading-6 text-muted-foreground">
              <input
                checked={agreed}
                className="mt-1 size-4 accent-green-500"
                onChange={(event) => setAgreed(event.target.checked)}
                type="checkbox"
              />
              <span>
                <Link className="font-bold line-green hover:underline" href="/terms">
                  利用規約
                </Link>
                と
                <Link className="font-bold line-green hover:underline" href="/privacy">
                  プライバシーポリシー
                </Link>
                に同意します。
              </span>
            </label>
          ) : null}

          <Button
            className="h-12 line-bg text-base font-black"
            disabled={isPending}
            type="submit"
          >
            {isRegister ? <UserPlus data-icon="inline-start" /> : <LogIn data-icon="inline-start" />}
            {isRegister ? "アカウントを作成" : "ログインする"}
          </Button>
        </form>

        <Button
          className="mt-3 h-12 w-full text-base font-black"
          disabled={isPending}
          onClick={continueDemo}
          variant="outline"
        >
          デモアカウントで続行
          <ArrowRight data-icon="inline-end" />
        </Button>

        <p className="mt-5 text-center text-sm font-medium text-muted-foreground">
          {isRegister ? "すでにアカウントがありますか？" : "まだアカウントがありませんか？"}{" "}
          <Link
            className="font-black line-green hover:underline"
            href={isRegister ? "/login" : "/register"}
          >
            {isRegister ? "ログイン" : "無料で試す"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
