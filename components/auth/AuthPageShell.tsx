import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { generatedAssetUrls } from "@/lib/generated-assets";

type AuthPageShellProps = {
  children: ReactNode;
  title: string;
  description: string;
};

const checklist = [
  "24個スタンプのデモプロジェクト付き",
  "Creators Market向けチェックUIを確認可能",
  "クレジット上限と書き出し数を明示",
];

export function AuthPageShell({ children, title, description }: AuthPageShellProps) {
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto grid min-h-screen max-w-[1180px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <section className="hidden rounded-2xl border bg-white p-8 shadow-sm lg:block">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:line-green"
            href="/"
          >
            <ArrowLeft data-icon="inline-start" />
            LPへ戻る
          </Link>
          <div className="mt-10">
            <div className="flex items-center gap-3">
              <span className="flex size-14 items-center justify-center rounded-2xl border bg-white shadow-sm">
                <GeneratedAssetImage
                  alt="白うさぎマジシャンのマスコット"
                  className="size-12 rounded-xl"
                  src={generatedAssetUrls.mascot}
                />
              </span>
              <div>
                <p className="text-sm font-black line-green">StampForge AI</p>
                <h1 className="text-3xl font-black text-zinc-950">{title}</h1>
              </div>
            </div>
            <p className="mt-5 text-sm font-medium leading-7 text-muted-foreground">
              {description}
            </p>
            <div className="mt-7 flex flex-col gap-3">
              {checklist.map((item) => (
                <div className="flex items-start gap-2 text-sm font-semibold" key={item}>
                  <CheckCircle2 className="mt-0.5 text-emerald-600" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 overflow-hidden rounded-2xl border bg-green-50 p-4">
            <GeneratedAssetImage
              alt="白うさぎマジシャンの24個スタンプシート"
              className="aspect-[6/4] w-full rounded-xl bg-white"
              imageClassName="object-cover"
              src={generatedAssetUrls.stickerSheet24}
            />
          </div>
        </section>

        <section className="flex min-w-0 items-center justify-center">
          <div className="w-full max-w-[520px]">
            <Link
              className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:line-green lg:hidden"
              href="/"
            >
              <ArrowLeft data-icon="inline-start" />
              LPへ戻る
            </Link>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
