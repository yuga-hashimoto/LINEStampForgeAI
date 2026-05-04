import {
  Archive,
  Bot,
  CheckSquare,
  FileImage,
  Grid2X2,
  Image,
  Maximize2,
  MegaphoneOff,
  PackageCheck,
  Palette,
  Ruler,
  ShieldCheck,
} from "lucide-react";

import { RuleChip } from "@/components/ui/RuleChip";
import { ruleChips } from "@/lib/constants";

const icons = [
  Grid2X2,
  Maximize2,
  Image,
  FileImage,
  Palette,
  Ruler,
  CheckSquare,
  Archive,
  PackageCheck,
  ShieldCheck,
  MegaphoneOff,
  Bot,
];

export function RuleChips() {
  return (
    <section className="border-y bg-zinc-50/80" id="features">
      <div className="mx-auto max-w-[1480px] px-5 py-8 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {ruleChips.map((chip, index) => (
            <RuleChip
              detail={chip.detail}
              icon={icons[index] ?? ShieldCheck}
              key={chip.label}
              label={chip.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
