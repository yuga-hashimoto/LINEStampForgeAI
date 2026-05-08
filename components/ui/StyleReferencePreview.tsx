import { cn } from "@/lib/utils";

type ArtStyleReferencePreviewProps = {
  styleName: string;
  className?: string;
};

type LineWeightReferencePreviewProps = {
  weight: string;
  className?: string;
};

const artStyleConfig: Record<
  string,
  {
    accent: string;
    background: string;
    cheek: string;
    dash?: string;
    fill: string;
    label: string;
    sparkle?: boolean;
    stroke: string;
    strokeWidth: number;
  }
> = {
  LINEスタンプ向けポップ: {
    accent: "#06C755",
    background: "#ecfdf3",
    cheek: "#fda4af",
    fill: "#ffffff",
    label: "POP",
    sparkle: true,
    stroke: "#18181b",
    strokeWidth: 5,
  },
  ゆるかわ: {
    accent: "#fb7185",
    background: "#fff1f2",
    cheek: "#fecdd3",
    fill: "#fff7ed",
    label: "YURU",
    stroke: "#3f3f46",
    strokeWidth: 3,
  },
  手描き風: {
    accent: "#f97316",
    background: "#fff7ed",
    cheek: "#fdba74",
    dash: "6 3",
    fill: "#ffffff",
    label: "HAND",
    stroke: "#27272a",
    strokeWidth: 4,
  },
  アニメ調: {
    accent: "#2563eb",
    background: "#eff6ff",
    cheek: "#fb7185",
    fill: "#ffffff",
    label: "ANIME",
    sparkle: true,
    stroke: "#020617",
    strokeWidth: 5.5,
  },
  水彩ライト: {
    accent: "#38bdf8",
    background: "#f0f9ff",
    cheek: "#fbcfe8",
    fill: "#f8fafc",
    label: "WASH",
    stroke: "#475569",
    strokeWidth: 2.5,
  },
  シンプル線画: {
    accent: "#71717a",
    background: "#fafafa",
    cheek: "#e4e4e7",
    fill: "transparent",
    label: "LINE",
    stroke: "#18181b",
    strokeWidth: 2,
  },
};

const lineWeightConfig: Record<string, { label: string; strokeWidth: number }> = {
  細め: { label: "Thin", strokeWidth: 2.25 },
  標準: { label: "Regular", strokeWidth: 4 },
  太め: { label: "Bold", strokeWidth: 6.5 },
};

export function ArtStyleReferencePreview({ className, styleName }: ArtStyleReferencePreviewProps) {
  const config = artStyleConfig[styleName] ?? artStyleConfig["LINEスタンプ向けポップ"];

  return (
    <div
      className={cn("overflow-hidden rounded-lg border bg-white shadow-xs", className)}
      aria-label={`${styleName}の参考画像`}
    >
      <svg className="block size-full" viewBox="0 0 128 86" role="img" aria-hidden="true">
        <rect width="128" height="86" rx="12" fill={config.background} />
        <circle cx="29" cy="26" r="10" fill={config.accent} opacity="0.16" />
        <circle cx="102" cy="62" r="13" fill={config.accent} opacity="0.12" />
        {config.sparkle ? (
          <>
            <path d="M104 18l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill={config.accent} />
            <path d="M25 58l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill={config.accent} />
          </>
        ) : null}
        <g
          fill={config.fill}
          stroke={config.stroke}
          strokeDasharray={config.dash}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={config.strokeWidth}
        >
          <path d="M48 37c-11-14-10-27-3-30 8-3 14 10 14 27" />
          <path d="M80 37c11-14 10-27 3-30-8-3-14 10-14 27" />
          <path d="M39 37h50" fill="none" />
          <path d="M47 35c0-9 7-15 17-15s17 6 17 15" fill="#18181b" stroke="#18181b" />
          <path d="M42 43c0-13 10-23 22-23s22 10 22 23c0 16-10 27-22 27S42 59 42 43z" />
        </g>
        <g fill={config.stroke}>
          <circle cx="55" cy="47" r="2.8" />
          <circle cx="73" cy="47" r="2.8" />
          <path d="M61 56c2 2 4 2 6 0" fill="none" stroke={config.stroke} strokeLinecap="round" strokeWidth="2.5" />
        </g>
        <g fill={config.cheek} opacity="0.9">
          <ellipse cx="50" cy="54" rx="5" ry="3" />
          <ellipse cx="78" cy="54" rx="5" ry="3" />
        </g>
        <rect x="9" y="9" width="40" height="16" rx="8" fill="#ffffff" opacity="0.86" />
        <text x="29" y="21" fill={config.stroke} fontFamily="Arial, sans-serif" fontSize="9" fontWeight="700" textAnchor="middle">
          {config.label}
        </text>
      </svg>
    </div>
  );
}

export function LineWeightReferencePreview({ className, weight }: LineWeightReferencePreviewProps) {
  const config = lineWeightConfig[weight] ?? lineWeightConfig["標準"];

  return (
    <div
      className={cn("overflow-hidden rounded-lg border bg-white shadow-xs", className)}
      aria-label={`${weight}の参考画像`}
    >
      <svg className="block size-full" viewBox="0 0 128 64" role="img" aria-hidden="true">
        <rect width="128" height="64" rx="12" fill="#f7fee7" />
        <path
          d="M22 43c9-17 21-22 34-13 9 7 17 7 26-1 9-8 18-6 25 8"
          fill="none"
          stroke="#06C755"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={config.strokeWidth}
        />
        <g
          fill="#fff"
          stroke="#18181b"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={config.strokeWidth}
        >
          <path d="M51 27c-6-10-5-18 0-20 6-2 10 7 10 18" />
          <path d="M77 27c6-10 5-18 0-20-6-2-10 7-10 18" />
          <path d="M47 31c0-10 8-18 17-18s17 8 17 18c0 12-8 20-17 20s-17-8-17-20z" />
        </g>
        <circle cx="58" cy="32" r="2.2" fill="#18181b" />
        <circle cx="70" cy="32" r="2.2" fill="#18181b" />
        <text x="14" y="17" fill="#166534" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700">
          {config.label}
        </text>
      </svg>
    </div>
  );
}
