import { cn } from "@/lib/utils";

type StickerMockProps = {
  phrase?: string;
  effect?: string;
  pose?: string;
  variant?: "stamp" | "character" | "main" | "tab" | "avatar";
  angle?: "front" | "diagonal" | "side" | "back" | "expressions";
  density?: "normal" | "compact";
  showText?: boolean;
  className?: string;
};

const angleRotation = {
  front: "rotate-0",
  diagonal: "-rotate-3",
  side: "rotate-0",
  back: "rotate-0",
  expressions: "rotate-0",
};

export function StickerMock({
  phrase = "おはよう",
  effect = "✨",
  pose,
  variant = "stamp",
  angle = "front",
  density = "normal",
  showText = true,
  className,
}: StickerMockProps) {
  if (angle === "expressions") {
    return (
      <div
        className={cn(
          "grid size-full min-h-20 grid-cols-2 gap-1 rounded-md bg-white p-2",
          className
        )}
        aria-label="白うさぎマジシャンの表情差分"
      >
        {["😊", "😴", "😳", "🙏"].map((emoji, index) => (
          <div
            className="flex items-center justify-center rounded-md border bg-green-50"
            key={emoji}
          >
            <MiniRabbitFace expression={index} />
          </div>
        ))}
      </div>
    );
  }

  const isSide = angle === "side";
  const isBack = angle === "back";
  const isTab = variant === "tab";
  const isAvatar = variant === "avatar";
  const isCompact = density === "compact";

  return (
    <figure
      className={cn(
        "relative flex aspect-[1/1.05] min-h-20 flex-col items-center justify-start overflow-visible rounded-md bg-white p-1.5",
        variant === "stamp" && "min-h-[96px]",
        isCompact && "min-h-[84px] p-1",
        variant === "main" && "aspect-square min-h-36 justify-center p-4",
        isTab && "aspect-[96/74] min-h-16 flex-row justify-center p-2",
        isAvatar && "aspect-square min-h-12 rounded-lg p-1",
        className
      )}
      title={pose}
    >
      {showText && !isAvatar ? (
        <figcaption
          className={cn(
            "sticker-text z-10 max-w-full break-keep text-center leading-[1.03] text-[clamp(10px,1.6vw,18px)]",
            isCompact && "max-h-[2.08em] overflow-hidden text-[clamp(7px,0.82vw,11px)]",
            isTab && "sr-only",
            variant === "main" && "text-xl"
          )}
        >
          {phrase}
        </figcaption>
      ) : null}

      <div
        className={cn(
          "relative mt-1 w-[70%] max-w-28 flex-1",
          isCompact && "mt-0.5 w-[66%] max-w-20",
          variant === "main" && "mt-0 w-[74%] max-w-40",
          isTab && "mt-0 w-[42%] max-w-16 flex-none",
          isAvatar && "mt-0 w-full max-w-12",
          angleRotation[angle],
          isSide && "scale-x-[0.78]",
          isBack && "scale-x-95"
        )}
        aria-hidden="true"
      >
        <div
          className={cn(
            "rabbit-ear left-[19%] rotate-[-10deg]",
            isBack && "bg-zinc-100"
          )}
        />
        <div
          className={cn(
            "rabbit-ear right-[19%] rotate-[10deg]",
            isBack && "bg-zinc-100"
          )}
        />
        <div className="rabbit-hat" />
        <div className={cn("rabbit-face", isBack && "bg-zinc-100")}>
          {!isBack ? (
            <>
              <span className="rabbit-blush left-[16%]" />
              <span className="rabbit-blush right-[16%]" />
              <span className="absolute left-1/2 top-[57%] size-[6%] -translate-x-1/2 rounded-full line-bg" />
              <span className="absolute left-[42%] top-[68%] h-[1.5px] w-[16%] rounded-full bg-zinc-900" />
            </>
          ) : (
            <span className="absolute inset-x-[26%] bottom-[18%] h-[2px] rounded-full bg-zinc-400" />
          )}
        </div>
        <div className="rabbit-body">
          <span className="rabbit-cape" />
          <span className="absolute left-[36%] top-[12%] h-[55%] w-[28%] rounded-b-full bg-green-600" />
          <span className="absolute left-[18%] top-[23%] h-[18%] w-[18%] rounded-full bg-white" />
          <span className="absolute right-[18%] top-[23%] h-[18%] w-[18%] rounded-full bg-white" />
        </div>
      </div>

      {!isAvatar && !isTab ? (
        <span
          className={cn(
            "absolute left-1 top-[30%] text-[clamp(12px,2vw,22px)]",
            isCompact && "text-[clamp(9px,1vw,14px)]"
          )}
        >
          {effect}
        </span>
      ) : null}
      {!isAvatar && !isTab ? (
        <span
          className={cn(
            "absolute bottom-2 right-2 text-[clamp(10px,1.6vw,18px)]",
            isCompact && "bottom-1 right-1 text-[clamp(8px,0.9vw,12px)]"
          )}
        >
          {effect === "✨" ? "⭐" : "✨"}
        </span>
      ) : null}
    </figure>
  );
}

function MiniRabbitFace({ expression }: { expression: number }) {
  const mouth = ["h-[2px] w-4", "h-[2px] w-3", "size-2", "h-[2px] w-5"][expression];

  return (
    <div className="relative size-10">
      <span className="rabbit-ear left-[18%] scale-50" />
      <span className="rabbit-ear right-[18%] scale-50" />
      <span className="rabbit-hat scale-75" />
      <div className="rabbit-face absolute bottom-0 left-1/2 w-9 -translate-x-1/2">
        <span className="rabbit-blush left-[13%]" />
        <span className="rabbit-blush right-[13%]" />
        <span
          className={cn(
            "absolute left-1/2 top-[68%] -translate-x-1/2 rounded-full bg-zinc-900",
            mouth
          )}
        />
      </div>
    </div>
  );
}
