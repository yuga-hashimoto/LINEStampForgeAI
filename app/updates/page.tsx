import type { Metadata } from "next";

import { MarketingShell } from "@/components/site/MarketingShell";
import { Card, CardContent } from "@/components/ui/card";
import { productUpdates } from "@/lib/operational-data";

export const metadata: Metadata = {
  title: "アップデート | StampForge AI",
  description: "StampForge AIの更新履歴。",
};

export default function UpdatesPage() {
  return (
    <MarketingShell>
      <section className="bg-zinc-50 py-12">
        <div className="mx-auto max-w-[900px] px-5 sm:px-8">
          <p className="text-sm font-black line-green">Updates</p>
          <h1 className="mt-3 text-4xl font-black text-zinc-950">アップデート</h1>
          <div className="mt-8 flex flex-col gap-4">
            {productUpdates.map((update) => (
              <Card className="rounded-xl bg-white shadow-sm" key={update.title}>
                <CardContent className="p-6">
                  <p className="text-sm font-black line-green">{update.date}</p>
                  <h2 className="mt-2 text-xl font-black text-zinc-950">{update.title}</h2>
                  <p className="mt-3 text-sm font-medium leading-7 text-muted-foreground">
                    {update.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
