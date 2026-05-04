import type { Metadata } from "next";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

export const metadata: Metadata = {
  title: "StampForge AI | LINEスタンプ制作SaaS",
  description:
    "キャラクターシート生成からスタンプシート生成、自動スライス、LINE Creators Market向けZIP書き出しまでを支援する日本語UIのLINEスタンプ制作SaaS MVPです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <TooltipProvider delayDuration={120}>{children}</TooltipProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
