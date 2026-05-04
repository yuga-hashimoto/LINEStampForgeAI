import { CheckCircle2, Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CheckItem } from "@/lib/types";

type CreatorsMarketCheckCardProps = {
  checks: CheckItem[];
};

export function CreatorsMarketCheckCard({ checks }: CreatorsMarketCheckCardProps) {
  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-black">Creators Market 自動チェック</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {checks.map((check) => (
            <div className="flex items-start gap-2 text-sm font-bold text-zinc-800" key={check.id}>
              <CheckCircle2 className="mt-0.5 text-emerald-600" aria-hidden="true" />
              <span>{check.label}</span>
              {check.description ? (
                <Tooltip>
                  <TooltipTrigger className="text-muted-foreground">
                    <Info aria-hidden="true" />
                    <span className="sr-only">{check.label}の説明</span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">{check.description}</TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
