import Link from "next/link";
import {
  ChevronDown,
  Download,
  FolderOpen,
  Grid3X3,
  Home,
  MessageSquare,
  Settings,
  Smile,
} from "lucide-react";

import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { generatedAssetUrls } from "@/lib/generated-assets";

export const appSidebarMenuItems = [
  { label: "ダッシュボード", icon: Home, href: "/app" },
  { label: "プロジェクト", icon: FolderOpen, href: "/app/projects" },
  { label: "キャラシート", icon: Smile, href: "/app/projects/demo#character-sheet" },
  { label: "スタンプセット", icon: Grid3X3, href: "/app/templates" },
  { label: "レビュー", icon: MessageSquare, href: "/app/projects/demo#checks" },
  { label: "書き出し", icon: Download, href: "/app/projects/demo#export" },
  { label: "設定", icon: Settings, href: "/app/settings" },
] as const;

export type AppSidebarActiveItem = (typeof appSidebarMenuItems)[number]["label"];

type AppSidebarProps = {
  active?: AppSidebarActiveItem;
};

export function AppSidebar({ active = "プロジェクト" }: AppSidebarProps) {
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
        {appSidebarMenuItems.map((item) => (
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
