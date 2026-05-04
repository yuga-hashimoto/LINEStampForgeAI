import { Check } from "lucide-react";

import type { WorkflowStep } from "@/lib/types";
import { cn } from "@/lib/utils";

type WorkflowStepperProps = {
  steps: WorkflowStep[];
};

export function WorkflowStepper({ steps }: WorkflowStepperProps) {
  return (
    <section className="px-5 py-5 xl:px-8">
      <div className="flex overflow-x-auto rounded-xl border bg-white shadow-sm">
        {steps.map((step, index) => (
          <div
            className={cn(
              "relative flex min-w-[220px] flex-1 items-center gap-4 px-5 py-4",
              step.status === "active" && "bg-green-50 text-green-700",
              step.status === "done" && "bg-emerald-50 text-emerald-700",
              step.status === "pending" && "bg-white text-zinc-500"
            )}
            key={step.id}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-black",
                step.status === "active" && "line-bg text-white",
                step.status === "done" && "bg-emerald-600 text-white",
                step.status === "pending" && "bg-zinc-100 text-zinc-600"
              )}
            >
              {step.status === "done" ? <Check aria-hidden="true" /> : step.id}
            </span>
            <span className="whitespace-nowrap text-sm font-black">{step.label}</span>
            {index < steps.length - 1 ? (
              <span className="absolute right-0 top-0 h-full w-px bg-border" aria-hidden="true" />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
