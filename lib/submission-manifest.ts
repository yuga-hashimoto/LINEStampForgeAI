import { generatedAssetUrls } from "@/lib/generated-assets";
import type { CheckItem, SubmissionManifest, SubmissionPackDraft } from "@/lib/types";

const checkAliases = {
  png: ["png"],
  transparentBackground: ["transparent", "background"],
  stickerSizeWithin370x320: ["stamp-size", "370", "320"],
  mainImage240x240: ["main", "240"],
  tabImage96x74: ["tab", "96", "74"],
  fileSizeWithin1MB: ["under-1mb", "1mb"],
  zipWithin60MB: ["zip", "60mb"],
  evenPixels: ["even-px", "偶数"],
  marginAround10px: ["padding", "余白"],
  advertisingRisk: ["ads", "広告"],
  rightsRisk: ["rights", "権利"],
} satisfies Record<keyof SubmissionManifest["checks"], string[]>;

export function buildSubmissionManifest(
  draft: SubmissionPackDraft,
  options?: { baseUrl?: string; zipUrl?: string }
): SubmissionManifest {
  const baseUrl = options?.baseUrl ?? "";
  const assetUrl = (path: string) => {
    if (!baseUrl || path.startsWith("http")) {
      return path;
    }

    return `${baseUrl}${path}`;
  };

  return {
    projectId: draft.project.id,
    stickerType: "static",
    stickerCount: draft.project.stickerCount,
    title: {
      ja: draft.title.ja.trim() || draft.project.name,
      en: draft.title.en?.trim() || undefined,
    },
    description: {
      ja:
        draft.description.ja.trim() ||
        "白うさぎマジシャンの日常会話向けLINEスタンプです。",
      en: draft.description.en?.trim() || undefined,
    },
    creatorName: draft.creatorName.trim() || draft.project.studioName,
    copyright:
      draft.copyright.trim() ||
      `© ${new Date().getFullYear()} ${draft.project.studioName}`,
    containsAiGeneratedContent: draft.containsAiGeneratedContent,
    zipUrl: options?.zipUrl ?? "",
    mainImageUrl: assetUrl(generatedAssetUrls.mascot),
    tabImageUrl: assetUrl(generatedAssetUrls.mascot),
    checks: mapSubmissionChecks(draft.checks),
  };
}

export function mapSubmissionChecks(checks: CheckItem[]): SubmissionManifest["checks"] {
  return Object.fromEntries(
    Object.entries(checkAliases).map(([key, aliases]) => [
      key,
      resolveCheckStatus(checks, aliases, key),
    ])
  ) as SubmissionManifest["checks"];
}

function resolveCheckStatus(checks: CheckItem[], aliases: string[], key: string) {
  const item = checks.find((check) => {
    const haystack = `${check.id} ${check.label}`.toLowerCase();
    return aliases.some((alias) => haystack.includes(alias.toLowerCase()));
  });

  const isRiskCheck = key === "advertisingRisk" || key === "rightsRisk";

  if (!item) {
    return isRiskCheck ? false : true;
  }

  return isRiskCheck ? item.status !== "pass" : item.status === "pass";
}
