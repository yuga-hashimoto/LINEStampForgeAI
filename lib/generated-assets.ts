const demoGeneratedProjectId = "magic-rabbit-vol-1";

export const demoGeneratedAssetUrls = getGeneratedProjectAssetUrls(demoGeneratedProjectId);

export const generatedAssetUrls = demoGeneratedAssetUrls;

export function normalizeGeneratedProjectId(projectId?: string | null) {
  if (!projectId || projectId === "demo") {
    return demoGeneratedProjectId;
  }

  return projectId;
}

export function getGeneratedProjectAssetUrls(projectId?: string | null) {
  const normalizedProjectId = normalizeGeneratedProjectId(projectId);
  const base = `/generated/projects/${normalizedProjectId}`;

  return {
    mascot: `${base}/mascot.png`,
    main: `${base}/main.png`,
    tab: `${base}/tab.png`,
    characterSheet: `${base}/character-sheet.png`,
    stickerSheet24: `${base}/sticker-sheet-24.png`,
    regeneratedCell12: `${base}/regenerated-cell-12.png`,
    characterViews: {
      front: `${base}/character-views/front.png`,
      diagonal: `${base}/character-views/diagonal.png`,
      side: `${base}/character-views/side.png`,
      back: `${base}/character-views/back.png`,
      expressions: `${base}/character-views/expressions.png`,
    },
  } as const;
}

export function getStickerCellUrl(index: number, projectId?: string | null) {
  const normalizedIndex = Math.min(40, Math.max(1, Math.trunc(index)));
  return `/generated/projects/${normalizeGeneratedProjectId(projectId)}/stamps/${String(normalizedIndex).padStart(2, "0")}.png`;
}

export function withAssetVersion(url: string, version?: string | number | null) {
  if (!version) {
    return url;
  }

  return `${url}?v=${encodeURIComponent(String(version))}`;
}
