import Link from "next/link";
import type { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import { Bell, HelpCircle } from "lucide-react";

import { AppSearchBox } from "@/components/app/AppSearchBox";
import { AppMobileNav } from "@/components/dashboard/AppMobileNav";
import { AppSidebar, type AppSidebarActiveItem } from "@/components/dashboard/AppSidebar";
import { Button } from "@/components/ui/button";
import { isClerkPublicConfigured } from "@/lib/auth-config";

type AppFrameProps = {
  active: AppSidebarActiveItem;
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
};

export function AppFrame({
  active,
  title,
  description,
  children,
  action,
}: AppFrameProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="flex">
        <AppSidebar active={active} />
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b bg-white/95 px-5 py-4 backdrop-blur xl:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black line-green">LINEスタンプ制作ワークスペース</p>
                <h1 className="mt-1 text-2xl font-black text-zinc-950">{title}</h1>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{description}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <AppSearchBox />
                <div className="flex items-center gap-2">
                  <Button asChild size="icon" variant="outline">
                    <Link href="/help" aria-label="ヘルプ">
                      <HelpCircle aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button size="icon" variant="outline" aria-label="通知">
                    <Bell aria-hidden="true" />
                  </Button>
                  {isClerkPublicConfigured() ? (
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "size-9",
                        },
                      }}
                    />
                  ) : (
                    <span className="inline-flex h-9 items-center rounded-full border bg-green-50 px-3 text-xs font-black text-green-700">
                      開発デモ
                    </span>
                  )}
                  {action}
                </div>
              </div>
            </div>
          </header>
          <AppMobileNav active={active} />
          <main className="px-5 py-6 xl:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
