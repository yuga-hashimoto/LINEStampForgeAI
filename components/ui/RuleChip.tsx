import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type RuleChipProps = {
  icon: LucideIcon;
  label: string;
  detail?: string;
  className?: string;
};

export function RuleChip({ icon: Icon, label, detail, className }: RuleChipProps) {
  return (
    <div
      className={cn(
        "flex min-h-14 items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm",
        className
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-green-50 line-green">
        <Icon aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-zinc-900">{label}</span>
        {detail ? (
          <span className="block text-xs font-medium text-muted-foreground">{detail}</span>
        ) : null}
      </span>
    </div>
  );
}
