import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

type StickerCount = 8 | 16 | 24 | 32 | 40;

type SubmissionManifest = {
  projectId: string;
  stickerType: "static";
  stickerCount: StickerCount;
  title: { ja: string; en?: string };
  description: { ja: string; en?: string };
  creatorName: string;
  copyright: string;
  containsAiGeneratedContent: boolean;
  zipUrl: string;
  mainImageUrl?: string;
  tabImageUrl?: string;
  checks: {
    png?: boolean;
    transparentBackground?: boolean;
    stickerSizeWithin370x320?: boolean;
    mainImage240x240?: boolean;
    tabImage96x74?: boolean;
    fileSizeWithin1MB?: boolean;
    zipWithin60MB?: boolean;
    evenPixels?: boolean;
    marginAround10px?: boolean;
    advertisingRisk?: boolean;
    rightsRisk?: boolean;
  };
};

type FieldDescriptor = {
  id: string;
  label: string;
  tagName: string;
  type: string;
  target?: string;
  required: boolean;
  currentValue: string;
};

type PageScan = {
  ok: boolean;
  url: string;
  loginState: string;
  isLoginPage: boolean;
  fields: FieldDescriptor[];
  fileInputs: FieldDescriptor[];
  forbiddenButtons: string[];
  warnings: string[];
};

type ActionResponse = {
  ok: boolean;
  page?: PageScan;
  filled?: string[];
  skipped?: string[];
  logs?: string[];
  warnings?: string[];
  fallbackRequired?: boolean;
  nextAction?: string;
};

const warningCopy =
  "この拡張機能は、Creators Marketへの入力作業を補助するものです。LINE公式サービスではありません。審査通過を保証するものではありません。ログイン、最終確認、販売申請はユーザーご自身で行ってください。";

const checkLabels: Array<[keyof SubmissionManifest["checks"], string, boolean]> = [
  ["png", "PNG", true],
  ["transparentBackground", "背景透過", true],
  ["stickerSizeWithin370x320", "370×320以内", true],
  ["mainImage240x240", "メイン画像 240×240", true],
  ["tabImage96x74", "タブ画像 96×74", true],
  ["fileSizeWithin1MB", "1MB以内", true],
  ["zipWithin60MB", "ZIP 60MB以内", true],
  ["evenPixels", "偶数px", true],
  ["marginAround10px", "余白 約10px", true],
  ["advertisingRisk", "広告リスクなし", false],
  ["rightsRisk", "権利リスクなし", false],
];

function App() {
  const [manifestUrl, setManifestUrl] = useState("");
  const [manifest, setManifest] = useState<SubmissionManifest | null>(null);
  const [pageScan, setPageScan] = useState<PageScan | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  const detectedTargets = useMemo(
    () => pageScan?.fields.filter((field) => field.target) ?? [],
    [pageScan]
  );
  const manifestCheckSummary = useMemo(() => {
    if (!manifest) {
      return { ok: 0, total: checkLabels.length };
    }

    return checkLabels.reduce(
      (summary, [key, , expected]) => {
        const value = manifest.checks[key];
        return {
          total: summary.total + 1,
          ok: summary.ok + (value === expected || value === undefined ? 1 : 0),
        };
      },
      { ok: 0, total: 0 }
    );
  }, [manifest]);

  const appendLogs = useCallback((entries: string[]) => {
    setLogs((current) => [
      ...entries.map((entry) => `${new Date().toLocaleTimeString("ja-JP")} ${entry}`),
      ...current,
    ].slice(0, 40));
  }, []);

  const restoreState = useCallback(async () => {
    const stored = await chrome.storage.local.get([
      "stampforgeManifestUrl",
      "stampforgeManifest",
      "stampforgeLogs",
    ]);

    if (typeof stored.stampforgeManifestUrl === "string") {
      setManifestUrl(stored.stampforgeManifestUrl);
    }

    if (isSubmissionManifest(stored.stampforgeManifest)) {
      setManifest(stored.stampforgeManifest);
    }

    if (Array.isArray(stored.stampforgeLogs)) {
      setLogs(stored.stampforgeLogs.filter((item): item is string => typeof item === "string"));
    }
  }, []);

  const loadManifest = async () => {
    setIsBusy(true);

    try {
      const response = await fetch(manifestUrl.trim(), { credentials: "omit" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = (await response.json()) as unknown;

      if (!isSubmissionManifest(json)) {
        throw new Error("submission-manifest.jsonの形式が正しくありません。");
      }

      setManifest(json);
      await chrome.storage.local.set({
        stampforgeManifestUrl: manifestUrl.trim(),
        stampforgeManifest: json,
      });
      appendLogs([`申請パック ${json.projectId} を読み込みました。`]);
    } catch (error) {
      appendLogs([error instanceof Error ? error.message : "申請パックの読み込みに失敗しました。"]);
    } finally {
      setIsBusy(false);
    }
  };

  const detectFields = useCallback(async () => {
    setIsBusy(true);

    try {
      const response = await sendToActiveTab<PageScan>({ type: "STAMPFORGE_DETECT_FIELDS" });
      setPageScan(response);
      appendLogs([`フォーム検出: ${response.fields.length}件 / ZIP欄 ${response.fileInputs.length}件`]);
    } catch (error) {
      appendLogs([error instanceof Error ? error.message : "Creators Marketページを検出できません。"]);
    } finally {
      setIsBusy(false);
    }
  }, [appendLogs]);

  useEffect(() => {
    void restoreState();
    void detectFields();
  }, [restoreState, detectFields]);

  const applyToPage = async () => {
    if (!manifest) {
      appendLogs(["申請パックを先に読み込んでください。"]);
      return;
    }

    setIsBusy(true);

    try {
      const response = await sendToActiveTab<ActionResponse>({
        type: "STAMPFORGE_APPLY_MANIFEST",
        manifest,
      });
      appendLogs([
        ...(response.logs ?? []),
        ...(response.warnings ?? []),
        `入力結果: ${response.filled?.length ?? 0}件入力 / ${response.skipped?.length ?? 0}件スキップ`,
      ]);
      await detectFields();
    } catch (error) {
      appendLogs([error instanceof Error ? error.message : "自動入力に失敗しました。"]);
    } finally {
      setIsBusy(false);
    }
  };

  const runPreflight = async () => {
    setIsBusy(true);

    try {
      const response = await sendToActiveTab<ActionResponse>({
        type: "STAMPFORGE_CHECK_PAGE",
        manifest: manifest ?? undefined,
      });

      if (response.page) {
        setPageScan(response.page);
      }

      appendLogs([
        response.ok ? "申請前チェックを完了しました。" : "申請前チェックで注意事項があります。",
        ...(response.warnings ?? []),
        response.nextAction ?? "最終申請はユーザー自身で実行してください。",
      ]);
    } catch (error) {
      appendLogs([error instanceof Error ? error.message : "申請前チェックに失敗しました。"]);
    } finally {
      setIsBusy(false);
    }
  };

  const tryZipUpload = async () => {
    if (!manifest) {
      appendLogs(["申請パックを先に読み込んでください。"]);
      return;
    }

    setIsBusy(true);

    try {
      const response = await sendToActiveTab<ActionResponse>({
        type: "STAMPFORGE_TRY_UPLOAD_ZIP",
        manifest,
      });
      appendLogs(response.logs ?? ["ZIPアップロード補助を実行しました。"]);
    } catch (error) {
      appendLogs([error instanceof Error ? error.message : "ZIPアップロード補助に失敗しました。"]);
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    void chrome.storage.local.set({ stampforgeLogs: logs });
  }, [logs]);

  return (
    <main className="panel">
      <header className="hero">
        <div className="brand-mark">SF</div>
        <div>
          <p className="eyebrow">StampForge AI</p>
          <h1>Creators Market 出品アシスタント</h1>
        </div>
      </header>

      <p className="notice">{warningCopy}</p>

      <section className="card">
        <div className="section-title">
          <span>申請パックURL</span>
          <span className="status-pill">{manifest ? "読み込み済み" : "未読み込み"}</span>
        </div>
        <textarea
          className="url-input"
          placeholder="https://.../api/submission-packs/{token}"
          value={manifestUrl}
          onChange={(event) => setManifestUrl(event.target.value)}
        />
        <button className="primary" disabled={isBusy || manifestUrl.trim().length === 0} onClick={loadManifest}>
          submission-manifest.json を読み込む
        </button>
      </section>

      <section className="grid two">
        <InfoCard label="ログイン状態の推定" value={pageScan?.loginState ?? "未確認"} />
        <InfoCard label="スタンプ数" value={manifest ? `${manifest.stickerCount}個` : "未読み込み"} />
        <InfoCard label="プロジェクト" value={manifest?.title.ja ?? manifest?.projectId ?? "未読み込み"} />
        <InfoCard label="ZIPステータス" value={manifest?.zipUrl ? "URLあり" : "未発行"} />
      </section>

      {manifest ? (
        <section className="card">
          <div className="section-title">
            <span>AI生成コンテンツ注意</span>
            <span className={manifest.containsAiGeneratedContent ? "warning-pill" : "status-pill"}>
              {manifest.containsAiGeneratedContent ? "表示確認が必要" : "なし"}
            </span>
          </div>
          <p className="muted">
            AI生成またはAI補助で作られたコンテンツとして扱われる可能性があります。販売画面での表示と最新ガイドラインを確認してください。
          </p>
        </section>
      ) : null}

      <section className="card">
        <div className="section-title">
          <span>自動入力できる項目</span>
          <button className="ghost" disabled={isBusy} onClick={detectFields}>
            入力内容を再チェック
          </button>
        </div>
        {detectedTargets.length > 0 ? (
          <ul className="field-list">
            {detectedTargets.map((field) => (
              <li key={field.id}>
                <span>{field.label}</span>
                <strong>{field.target}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Creators Marketの入力ページを開いて再チェックしてください。</p>
        )}
        {pageScan?.warnings.length ? (
          <ul className="warning-list">
            {pageScan.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {manifest ? (
        <section className="card">
          <div className="section-title">
            <span>入力前プレビュー</span>
            <span className="status-pill">
              {manifestCheckSummary.ok}/{manifestCheckSummary.total} OK
            </span>
          </div>
          <dl className="preview">
            <div>
              <dt>タイトル</dt>
              <dd>{manifest.title.ja}</dd>
            </div>
            <div>
              <dt>説明文</dt>
              <dd>{manifest.description.ja}</dd>
            </div>
            <div>
              <dt>クリエイター名</dt>
              <dd>{manifest.creatorName}</dd>
            </div>
            <div>
              <dt>コピーライト</dt>
              <dd>{manifest.copyright}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="actions">
        <button className="primary large" disabled={isBusy || !manifest} onClick={applyToPage}>
          このページに自動入力
        </button>
        <button className="secondary" disabled={isBusy} onClick={runPreflight}>
          申請前チェック
        </button>
        <button className="secondary" disabled={isBusy || !manifest} onClick={tryZipUpload}>
          ZIP実験アップロード
        </button>
      </section>

      <section className="card">
        <div className="section-title">
          <span>操作ログ</span>
          <span className="status-pill">{logs.length}件</span>
        </div>
        {logs.length > 0 ? (
          <ol className="log-list">
            {logs.map((log, index) => (
              <li key={`${log}-${index}`}>{log}</li>
            ))}
          </ol>
        ) : (
          <p className="muted">入力操作を行うとここに記録されます。</p>
        )}
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <section className="mini-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

async function sendToActiveTab<T>(message: unknown): Promise<T> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    throw new Error("アクティブなCreators Marketタブが見つかりません。");
  }

  return new Promise<T>((resolve, reject) => {
    chrome.tabs.sendMessage<T>(tab.id!, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message ?? "Content script is unavailable."));
        return;
      }

      resolve(response);
    });
  });
}

function isSubmissionManifest(value: unknown): value is SubmissionManifest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as SubmissionManifest;
  return (
    typeof candidate.projectId === "string" &&
    candidate.stickerType === "static" &&
    [8, 16, 24, 32, 40].includes(candidate.stickerCount) &&
    typeof candidate.title?.ja === "string" &&
    typeof candidate.description?.ja === "string" &&
    typeof candidate.creatorName === "string" &&
    typeof candidate.copyright === "string" &&
    typeof candidate.containsAiGeneratedContent === "boolean" &&
    typeof candidate.zipUrl === "string" &&
    typeof candidate.checks === "object"
  );
}

createRoot(document.getElementById("root")!).render(<App />);
