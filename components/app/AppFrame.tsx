import Link from "next/link";
import type { ReactNode } from "react";
import { Bell, HelpCircle, Search } from "lucide-react";

import { AppMobileNav } from "@/components/dashboard/AppMobileNav";
import { AppSidebar, type AppSidebarActiveItem } from "@/components/dashboard/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
                <div className="relative min-w-0 sm:w-72">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input className="bg-white pl-10" placeholder="プロジェクトを検索" />
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild size="icon" variant="outline">
                    <Link href="/help" aria-label="ヘルプ">
                      <HelpCircle aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button size="icon" variant="outline" aria-label="通知">
                    <Bell aria-hidden="true" />
                  </Button>
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
