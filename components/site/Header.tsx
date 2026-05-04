import Link from "next/link";
import { ArrowRight, WandSparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { generatedAssetUrls } from "@/lib/generated-assets";

const navItems = [
  { label: "機能", href: "/features" },
  { label: "料金", href: "/#pricing" },
  { label: "使い方", href: "/guide" },
  { label: "テンプレート", href: "/templates" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/92 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-[1480px] items-center justify-between px-5 sm:px-8">
        <Link className="flex items-center gap-3" href="/" aria-label="StampForge AI">
          <span className="flex size-11 items-center justify-center rounded-xl border bg-white shadow-sm">
            <GeneratedAssetImage
              alt="白うさぎマジシャンのマスコット"
              className="size-10 rounded-lg"
              src={generatedAssetUrls.mascot}
            />
          </span>
          <span className="text-xl font-bold text-zinc-950">StampForge AI</span>
          <span className="hidden rounded-full bg-green-50 px-2.5 py-1 text-xs font-black text-green-700 lg:inline-flex">
            LINEスタンプ制作
          </span>
        </Link>

        <nav className="hidden items-center gap-10 text-sm font-semibold text-zinc-600 md:flex">
          {navItems.map((item) => (
            <Link className="transition hover:line-green" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild className="hidden sm:inline-flex" variant="outline">
            <Link href="/login">ログイン</Link>
          </Button>
          <Button asChild className="line-bg shadow-sm">
            <Link href="/register">
              <WandSparkles data-icon="inline-start" />
              無料で試す
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
