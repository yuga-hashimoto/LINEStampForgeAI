import type { Metadata } from "next";

import { ContactForm } from "@/components/site/ContactForm";
import { MarketingShell } from "@/components/site/MarketingShell";

export const metadata: Metadata = {
  title: "お問い合わせ | StampForge AI",
  description: "StampForge AIへの問い合わせ、法人・商用レビュー相談はこちら。",
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <section className="bg-zinc-50 py-12">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-black line-green">Contact</p>
            <h1 className="mt-3 text-4xl font-black text-zinc-950">お問い合わせ</h1>
            <p className="mt-5 text-base font-medium leading-8 text-zinc-700">
              人間レビュー、法人・商用レビュー、制作代行での継続利用、店舗向けテンプレートなどの相談を受け付けます。
            </p>
            <div className="mt-7 rounded-xl border bg-white p-5 text-sm font-medium leading-7 text-muted-foreground">
              本サービスはLINE公式サービスではありません。審査通過を保証する相談は受け付けていません。
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </MarketingShell>
  );
}
