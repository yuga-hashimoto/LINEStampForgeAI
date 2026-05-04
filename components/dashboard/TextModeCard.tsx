import { Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { textModes } from "@/lib/constants";
import type { TextMode } from "@/lib/types";

type TextModeCardProps = {
  value: TextMode;
  onChange: (value: TextMode) => void;
};

export function TextModeCard({ value, onChange }: TextModeCardProps) {
  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <CardTitle className="text-xl font-black">文字モード</CardTitle>
        <Tooltip>
          <TooltipTrigger className="text-muted-foreground">
            <Info aria-hidden="true" />
            <span className="sr-only">文字モードの説明</span>
          </TooltipTrigger>
          <TooltipContent>日本語文字の読みやすさと修正しやすさを選べます。</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent>
        <ToggleGroup
          className="grid w-full grid-cols-3 gap-3"
          onValueChange={(nextValue) => {
            if (nextValue) onChange(nextValue as TextMode);
          }}
          type="single"
          value={value}
        >
          {textModes.map((mode) => (
            <ToggleGroupItem
              className="h-11 rounded-lg border bg-white px-2 text-xs font-black data-[state=on]:border-[#06C755] data-[state=on]:bg-green-50 data-[state=on]:text-green-700 sm:text-sm"
              key={mode.value}
              value={mode.value}
            >
              {mode.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="mt-4 flex flex-col gap-2">
          {textModes.map((mode) => (
            <p className="text-xs font-semibold leading-5 text-muted-foreground" key={mode.value}>
              <span className="font-black text-zinc-800">{mode.label}: </span>
              {mode.description}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
