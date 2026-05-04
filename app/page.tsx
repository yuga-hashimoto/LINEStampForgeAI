import { BestPractices } from "@/components/site/BestPractices";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { HeroSection } from "@/components/site/HeroSection";
import { PricingSection } from "@/components/site/PricingSection";
import { RuleChips } from "@/components/site/RuleChips";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <RuleChips />
      <BestPractices />
      <PricingSection />
      <section className="bg-white py-12" id="templates">
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
          <div className="rounded-2xl border bg-zinc-50 p-8">
            <p className="text-sm font-black line-green">テンプレート</p>
            <h2 className="mt-2 text-2xl font-black text-zinc-950">
              日常会話向けのセリフセットをすぐに開始
            </h2>
            <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-muted-foreground">
              あいさつ、感謝、謝罪、応援、報告などの基本テンプレートを用意しています。
              まず24個で反応を見てから、32個・40個へ展開できます。
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
