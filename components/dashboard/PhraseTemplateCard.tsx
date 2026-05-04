import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PhraseTemplateCardProps = {
  phrases: string[];
  selected: string[];
  onToggle: (phrase: string) => void;
  onAddClick: () => void;
};

export function PhraseTemplateCard({
  phrases,
  selected,
  onToggle,
  onAddClick,
}: PhraseTemplateCardProps) {
  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-xl font-black">セリフテンプレート</CardTitle>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">自由に編集できます</p>
        </div>
        <Badge variant="secondary">{selected.length}件選択</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {phrases.map((phrase) => {
            const isSelected = selected.includes(phrase);

            return (
              <button
                className={
                  isSelected
                    ? "rounded-lg border border-green-400 bg-green-50 px-4 py-2 text-sm font-black text-green-700"
                    : "rounded-lg border bg-white px-4 py-2 text-sm font-bold text-zinc-700 transition hover:border-green-300 hover:bg-green-50"
                }
                key={phrase}
                onClick={() => onToggle(phrase)}
                type="button"
              >
                {phrase}
              </button>
            );
          })}
          <Button className="rounded-lg" onClick={onAddClick} variant="outline">
            <Plus data-icon="inline-start" />
            追加
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
