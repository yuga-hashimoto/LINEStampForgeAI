import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export const metadata: Metadata = {
  title: "ログイン | StampForge AI",
  description: "StampForge AIの制作ワークスペースへログインします。",
};

export default function LoginPage() {
  return (
    <AuthPageShell
      description="制作中のスタンプセット、セリフテンプレート、Creators Market向けチェック結果へ戻れます。"
      title="ログイン"
    >
      <AuthForm mode="login" />
    </AuthPageShell>
  );
}
