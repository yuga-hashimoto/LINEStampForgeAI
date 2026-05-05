"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";

const searchableItems = [
  { label: "魔法うさぎスタンプ Vol.1", category: "キャラクターシート", href: "/app/projects/demo" },
  { label: "キャラクターシート一覧", category: "ワークスペース", href: "/app/projects" },
  { label: "日常会話テンプレート", category: "テンプレート", href: "/app/templates" },
  { label: "プランと利用量", category: "設定", href: "/app/billing" },
  { label: "利用量と接続ステータス", category: "設定", href: "/app/settings" },
  { label: "Creators Market自動チェック", category: "レビュー", href: "/app/projects/demo#checks" },
  { label: "ZIP書き出し", category: "書き出し", href: "/app/projects/demo#export" },
];

export function AppSearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return searchableItems.slice(0, 4);
    }

    return searchableItems
      .filter((item) =>
        `${item.label} ${item.category}`.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 5);
  }, [query]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (results.length === 0) {
      toast.error("該当する画面が見つかりませんでした");
      return;
    }

    router.push(results[0].href);
    setIsFocused(false);
  };

  return (
    <form className="relative min-w-0 sm:w-72" onSubmit={submitSearch}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        aria-label="ワークスペース内検索"
        className="bg-white pl-10"
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder="キャラクターシートや書き出しを検索"
        value={query}
      />
      {isFocused ? (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border bg-white shadow-xl shadow-zinc-950/10">
          {results.length > 0 ? (
            results.map((item) => (
              <button
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition hover:bg-green-50"
                key={item.href}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  router.push(item.href);
                  setIsFocused(false);
                }}
                type="button"
              >
                <span className="font-bold text-zinc-950">{item.label}</span>
                <span className="shrink-0 text-xs font-black text-green-700">
                  {item.category}
                </span>
              </button>
            ))
          ) : (
            <p className="px-4 py-3 text-sm font-medium text-muted-foreground">
              一致する画面がありません
            </p>
          )}
        </div>
      ) : null}
    </form>
  );
}
