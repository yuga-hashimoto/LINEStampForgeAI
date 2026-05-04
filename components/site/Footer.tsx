import Link from "next/link";
import { GeneratedAssetImage } from "@/components/ui/GeneratedAssetImage";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { generatedAssetUrls } from "@/lib/generated-assets";

const linkGroups = [
  {
    title: "プロダクト",
    links: [
      { label: "機能", href: "/features" },
      { label: "テンプレート", href: "/templates" },
      { label: "アップデート", href: "/updates" },
    ],
  },
  {
    title: "リソース",
    links: [
      { label: "使い方ガイド", href: "/guide" },
      { label: "ベストプラクティス", href: "/best-practices" },
      { label: "ヘルプセンター", href: "/help" },
    ],
  },
  {
    title: "サポート",
    links: [
      { label: "お問い合わせ", href: "/contact" },
      { label: "運営会社", href: "/company" },
      { label: "プライバシー", href: "/privacy" },
      { label: "利用規約", href: "/terms" },
      { label: "特商法表記", href: "/legal/commercial-transactions" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto grid max-w-[1480px] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.1fr_1.4fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl border bg-white shadow-sm">
              <GeneratedAssetImage
                alt="白うさぎマジシャンのマスコット"
                className="size-10 rounded-lg"
                src={generatedAssetUrls.mascot}
              />
            </span>
            <span className="text-lg font-black text-zinc-950">StampForge AI</span>
          </div>
          <p className="mt-4 max-w-xs text-sm font-medium leading-6 text-muted-foreground">
            AIで、スタンプ制作をもっと簡単に。
          </p>
          <p className="mt-6 text-xs font-medium leading-6 text-muted-foreground">
            本サービスはLINE公式サービスではありません。
            <br />
            審査通過を保証するものではありません。
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-black text-zinc-950">{group.title}</h3>
              <div className="mt-3 flex flex-col gap-2">
                {group.links.map((link) => (
                  <Link
                    className="text-sm font-medium text-muted-foreground hover:line-green"
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-black text-zinc-950">最新情報を受け取る</h3>
          <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
            新機能・アップデートのお知らせをお届けします。
          </p>
          <NewsletterSignup />
        </div>
      </div>
    </footer>
  );
}
