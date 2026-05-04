import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export const metadata: Metadata = {
  title: "無料で試す | StampForge AI",
  description: "StampForge AIのデモアカウントを作成して、制作ダッシュボードを試します。",
};

export default function RegisterPage() {
  return (
    <AuthPageShell
      description="クレカ不要で、キャラクターシート起点のスタンプ制作パイプラインをすぐに確認できます。"
      title="無料で試す"
    >
      <AuthForm mode="register" />
    </AuthPageShell>
  );
}
