import type { ProjectCreationDraft, ProjectStatus } from "@/lib/types";

export const PROJECT_DRAFTS_STORAGE_KEY = "stampforge:project-drafts";
export const ACTIVE_PROJECT_STORAGE_KEY = "stampforge:active-project-id";

const MAX_DRAFTS = 20;

export function createProjectId(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);

  return `${normalized || "project"}-${Date.now().toString(36)}`;
}

export function getStatusLabel(status: ProjectStatus) {
  const labels: Record<ProjectStatus, string> = {
    draft: "下書き",
    exported: "書き出し済み",
    generating: "生成中",
    review_ready: "レビュー前",
  };

  return labels[status];
}

export function getStoredProjectDrafts(): ProjectCreationDraft[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(PROJECT_DRAFTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isProjectCreationDraft);
  } catch {
    return [];
  }
}

export function findStoredProjectDraft(projectId: string) {
  return getStoredProjectDrafts().find((project) => project.id === projectId);
}

export function saveProjectDraft(draft: ProjectCreationDraft) {
  if (typeof window === "undefined") {
    return;
  }

  const existing = getStoredProjectDrafts().filter((project) => project.id !== draft.id);
  const next = [draft, ...existing].slice(0, MAX_DRAFTS);
  window.localStorage.setItem(PROJECT_DRAFTS_STORAGE_KEY, JSON.stringify(next));
  window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, draft.id);
}

function isProjectCreationDraft(value: unknown): value is ProjectCreationDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ProjectCreationDraft>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.studioName === "string" &&
    typeof candidate.stickerCount === "number" &&
    typeof candidate.textMode === "string" &&
    Array.isArray(candidate.phrases)
  );
}
