import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  Home,
  Settings,
  Smile,
} from "lucide-react";

import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { generatedAssetUrls } from "@/lib/generated-assets";

export type AppSidebarActiveItem =
  | "ダッシュボード"
  | "キャラクターシート"
  | "設定";

type AppSidebarMenuItem = {
  label: AppSidebarActiveItem;
  icon: LucideIcon;
  href: string;
};

export function getAppSidebarMenuItems(): AppSidebarMenuItem[] {
  return [
    { label: "ダッシュボード", icon: Home, href: "/app" },
    {
      label: "キャラクターシート",
      icon: Smile,
      href: "/app/projects",
    },
    { label: "設定", icon: Settings, href: "/app/settings" },
  ];
}

export const appSidebarMenuItems = getAppSidebarMenuItems();

type AppSidebarProps = {
  active?: AppSidebarActiveItem;
  projectId?: string;
};

export function AppSidebar({ active = "キャラクターシート" }: AppSidebarProps) {
  const menuItems = getAppSidebarMenuItems();

  return (
    <aside className="hidden min-h-screen border-r bg-white lg:flex lg:w-[248px] lg:flex-col">
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl border bg-white shadow-sm">
            <GeneratedAssetImage
              alt="白うさぎマジシャンのマスコット"
              className="size-11 rounded-lg"
              src={generatedAssetUrls.mascot}
            />
          </span>
          <div>
            <h1 className="text-lg font-black text-zinc-950">LINEスタンプメーカー</h1>
            <p className="text-xs font-semibold text-muted-foreground">非公式制作ツール</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-3">
        {menuItems.map((item) => (
          <Link
            aria-current={active === item.label ? "page" : undefined}
            className={
              active === item.label
                ? "flex h-14 items-center gap-3 rounded-xl bg-green-50 px-4 text-left text-sm font-black text-green-700"
                : "flex h-14 items-center gap-3 rounded-xl px-4 text-left text-sm font-bold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"
            }
            href={item.href}
            key={item.label}
          >
            <item.icon aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3">
        <Link
          className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:border-green-200 hover:bg-green-50/40"
          href="/app/settings"
        >
          <GeneratedAssetImage
            alt="マジックラビット"
            className="size-12 shrink-0 rounded-lg border bg-white"
            src={generatedAssetUrls.mascot}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-zinc-950">マジックラビット</p>
            <p className="text-xs font-semibold text-muted-foreground">プラン: スタンダード</p>
          </div>
          <ChevronDown aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
