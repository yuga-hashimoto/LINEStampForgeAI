import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type InfoSection = {
  title: string;
  body?: string[];
  items?: string[];
};

type InfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: InfoSection[];
  action?: {
    label: string;
    href: string;
  };
  aside?: ReactNode;
};

export function InfoPage({
  eyebrow,
  title,
  description,
  sections,
  action,
  aside,
}: InfoPageProps) {
  return (
    <section className="bg-zinc-50 py-12">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <p className="text-sm font-black line-green">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-zinc-950 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-base font-medium leading-8 text-zinc-700">
            {description}
          </p>
          {action ? (
            <Button asChild className="mt-7 line-bg">
              <Link href={action.href}>
                {action.label}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          ) : null}

          <div className="mt-9 flex flex-col gap-4">
            {sections.map((section) => (
              <Card className="rounded-xl bg-white shadow-sm" key={section.title}>
                <CardContent className="p-6">
                  <h2 className="text-xl font-black text-zinc-950">{section.title}</h2>
                  {section.body?.map((paragraph) => (
                    <p
                      className="mt-3 text-sm font-medium leading-7 text-muted-foreground"
                      key={paragraph}
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.items ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {section.items.map((item) => (
                        <div className="flex items-start gap-2 text-sm font-semibold" key={item}>
                          <CheckCircle2 className="mt-0.5 text-emerald-600" aria-hidden="true" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {aside ?? (
            <Card className="rounded-xl border-green-100 bg-white shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm font-black text-zinc-950">運用前の共通注意</p>
                <p className="mt-3 text-sm font-medium leading-7 text-muted-foreground">
                  本サービスはLINE公式サービスではありません。Creators Market向けチェックは
                  販売前の確認支援であり、審査通過を保証するものではありません。
                </p>
                <Button asChild className="mt-5 w-full" variant="outline">
                  <Link href="/terms">利用規約を確認</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </section>
  );
}
