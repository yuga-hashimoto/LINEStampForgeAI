import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { clerkPublishableKey, isClerkPublicConfigured } from "@/lib/auth-config";

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
  const app = (
    <>
      <TooltipProvider delayDuration={120}>{children}</TooltipProvider>
      <Toaster richColors position="top-right" />
    </>
  );

  return (
    <html data-scroll-behavior="smooth" lang="ja">
      <body>
        {isClerkPublicConfigured() ? (
          <ClerkProvider
            afterSignOutUrl="/"
            appearance={{
              variables: {
                colorPrimary: "#06c755",
                colorText: "#171717",
                borderRadius: "0.75rem",
              },
            }}
            publishableKey={clerkPublishableKey}
            signInFallbackRedirectUrl="/app"
            signInUrl="/login"
            signUpFallbackRedirectUrl="/app"
            signUpUrl="/register"
          >
            {app}
          </ClerkProvider>
        ) : (
          app
        )}
      </body>
    </html>
  );
}
