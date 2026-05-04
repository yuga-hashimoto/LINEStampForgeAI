import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { isClerkPublicConfigured } from "@/lib/auth-config";

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
      {isClerkPublicConfigured() ? (
        <SignIn
          fallbackRedirectUrl="/app"
          forceRedirectUrl="/app"
          routing="hash"
          signUpUrl="/register"
        />
      ) : (
        <AuthForm mode="login" />
      )}
    </AuthPageShell>
  );
}
