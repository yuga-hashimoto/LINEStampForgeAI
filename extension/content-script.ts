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
  checks: Record<string, boolean>;
};

type FillTarget =
  | "title.ja"
  | "title.en"
  | "description.ja"
  | "description.en"
  | "creatorName"
  | "copyright"
  | "containsAiGeneratedContent";

type FieldDescriptor = {
  id: string;
  label: string;
  tagName: string;
  type: string;
  target?: FillTarget;
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

type ExtensionMessage =
  | { type: "STAMPFORGE_DETECT_FIELDS" }
  | { type: "STAMPFORGE_APPLY_MANIFEST"; manifest: SubmissionManifest }
  | { type: "STAMPFORGE_CHECK_PAGE"; manifest?: SubmissionManifest }
  | { type: "STAMPFORGE_TRY_UPLOAD_ZIP"; manifest: SubmissionManifest };

const forbiddenButtonWords = [
  "申請",
  "販売申請",
  "request review",
  "submit",
  "送信",
  "確定",
  "公開",
  "購入",
  "決済",
];

const sensitiveWords = [
  "password",
  "passcode",
  "otp",
  "one-time",
  "two-factor",
  "2fa",
  "authentication code",
  "auth code",
  "captcha",
  "recaptcha",
  "パスワード",
  "認証コード",
  "確認コード",
  "二段階",
  "ワンタイム",
];

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  void handleMessage(message as ExtensionMessage)
    .then(sendResponse)
    .catch((error) => {
      sendResponse({
        ok: false,
        warnings: [error instanceof Error ? error.message : "Unknown content script error"],
      });
    });

  return true;
});

async function handleMessage(message: ExtensionMessage) {
  if (message.type === "STAMPFORGE_DETECT_FIELDS") {
    return scanPage();
  }

  if (message.type === "STAMPFORGE_CHECK_PAGE") {
    return runPreflight(message.manifest);
  }

  if (message.type === "STAMPFORGE_APPLY_MANIFEST") {
    return applyManifest(message.manifest);
  }

  if (message.type === "STAMPFORGE_TRY_UPLOAD_ZIP") {
    return tryExperimentalZipUpload(message.manifest);
  }

  return {
    ok: false,
    warnings: ["Unsupported message type"],
  };
}

function scanPage(): PageScan {
  const isLoginPage = detectLoginPage();
  const fields = collectFields(false);
  const fileInputs = collectFields(true);
  const forbiddenButtons = detectForbiddenButtons();
  const warnings: string[] = [];

  if (isLoginPage) {
    warnings.push("ログインまたは認証画面の可能性があるため、このページでは無効です。");
  }

  if (!isLoginPage && fields.length === 0 && fileInputs.length === 0) {
    warnings.push("入力可能なフォームを検出できませんでした。Creators MarketのDOM変更を確認してください。");
  }

  if (forbiddenButtons.length > 0) {
    warnings.push("申請・送信系のボタンを検出しました。拡張機能はこれらを自動クリックしません。");
  }

  return {
    ok: warnings.length === 0 || (!isLoginPage && fields.length > 0),
    url: location.href,
    loginState: estimateLoginState(isLoginPage),
    isLoginPage,
    fields,
    fileInputs,
    forbiddenButtons,
    warnings,
  };
}

function collectFields(fileOnly: boolean): FieldDescriptor[] {
  return Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    "input, textarea, select"
  ))
    .filter((element) => {
      if (!isHTMLElementVisible(element) || element.disabled || isReadOnly(element)) {
        return false;
      }

      if (isSensitiveElement(element)) {
        return false;
      }

      const isFile = element instanceof HTMLInputElement && element.type === "file";
      return fileOnly ? isFile : isFillableFormElement(element) && !isFile;
    })
    .map((element) => {
      const label = getElementLabel(element);

      return {
        id: ensureFieldId(element),
        label,
        tagName: element.tagName.toLowerCase(),
        type: element instanceof HTMLInputElement ? element.type || "text" : element.tagName.toLowerCase(),
        target: fileOnly ? undefined : classifyField(label, element),
        required: element.required,
        currentValue: readCurrentValue(element),
      };
    });
}

function applyManifest(manifest: SubmissionManifest) {
  const page = scanPage();

  if (page.isLoginPage) {
    return {
      ok: false,
      filled: [],
      skipped: [],
      logs: ["ログインまたは認証画面のため自動入力を停止しました。"],
      warnings: page.warnings,
    };
  }

  if (page.fields.length === 0) {
    return {
      ok: false,
      filled: [],
      skipped: [],
      logs: [],
      warnings: ["入力欄を検出できないため停止しました。Creators Marketの画面構造を確認してください。"],
    };
  }

  const values = buildManifestValues(manifest);
  const filled: string[] = [];
  const skipped: string[] = [];
  const logs: string[] = [];

  page.fields.forEach((field) => {
    if (!field.target) {
      skipped.push(`${field.label}: 対応する申請パック項目なし`);
      return;
    }

    const element = findFieldElement(field.id);

    if (!element || isSensitiveElement(element)) {
      skipped.push(`${field.label}: 入力欄を再検出できないためスキップ`);
      return;
    }

    const value = values[field.target];
    const applied = fillElement(element, value);

    if (applied) {
      filled.push(field.label);
      logs.push(`${field.label} に ${formatLogValue(value)} を入力しました。`);
    } else {
      skipped.push(`${field.label}: 自動入力できない形式です`);
    }
  });

  return {
    ok: filled.length > 0,
    filled,
    skipped,
    logs,
    warnings: [
      ...page.warnings,
      "申請・送信・公開などの最終操作は自動化していません。入力内容を確認してからユーザー自身で進めてください。",
    ],
  };
}

function runPreflight(manifest?: SubmissionManifest) {
  const page = scanPage();
  const warnings = [...page.warnings];

  if (manifest) {
    if (manifest.stickerType !== "static") {
      warnings.push("静止画スタンプ以外の申請パックは扱えません。");
    }

    if (!manifest.zipUrl) {
      warnings.push("ZIP URLがありません。安全方式で手動アップロードしてください。");
    }

    if (manifest.checks.advertisingRisk) {
      warnings.push("広告目的と判断される可能性がある項目があります。");
    }

    if (manifest.checks.rightsRisk) {
      warnings.push("権利確認が必要な項目があります。");
    }
  }

  return {
    ok: !page.isLoginPage && page.fields.length > 0,
    page,
    warnings,
    nextAction:
      "最終申請ボタンは拡張機能では押しません。Creators Market上でユーザーが内容を確認してください。",
  };
}

async function tryExperimentalZipUpload(manifest: SubmissionManifest) {
  const page = scanPage();

  if (page.isLoginPage) {
    return {
      ok: false,
      fallbackRequired: true,
      logs: ["ログインまたは認証画面ではZIPアップロード補助を無効化しました。"],
    };
  }

  const fileInput = Array.from(document.querySelectorAll<HTMLInputElement>("input[type='file']"))
    .filter((element) => isHTMLElementVisible(element) && !isSensitiveElement(element))
    .find((element) => /zip|ファイル|アップロード|upload/i.test(getElementLabel(element)));

  if (!fileInput) {
    return {
      ok: false,
      fallbackRequired: true,
      logs: ["ZIP用のファイル選択欄を検出できません。安全方式で手動選択してください。"],
    };
  }

  if (!manifest.zipUrl) {
    return {
      ok: false,
      fallbackRequired: true,
      logs: ["申請パックにZIP URLがありません。安全方式で手動選択してください。"],
    };
  }

  try {
    const response = await fetch(manifest.zipUrl, { credentials: "omit" });

    if (!response.ok) {
      throw new Error(`ZIP fetch failed: ${response.status}`);
    }

    const blob = await response.blob();
    const file = new File([blob], `${manifest.projectId}-submission-pack.zip`, {
      type: "application/zip",
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    dispatchInputEvents(fileInput);

    return {
      ok: true,
      fallbackRequired: false,
      logs: ["実験方式でZIPファイルをファイル選択欄にセットしました。送信は行っていません。"],
    };
  } catch (error) {
    return {
      ok: false,
      fallbackRequired: true,
      logs: [
        "実験方式のZIPセットに失敗しました。安全方式として、WebアプリでZIPをダウンロードして手動選択してください。",
        error instanceof Error ? error.message : "Unknown upload error",
      ],
    };
  }
}

function buildManifestValues(manifest: SubmissionManifest): Record<FillTarget, string | boolean> {
  return {
    "title.ja": manifest.title.ja,
    "title.en": manifest.title.en ?? "",
    "description.ja": manifest.description.ja,
    "description.en": manifest.description.en ?? "",
    creatorName: manifest.creatorName,
    copyright: manifest.copyright,
    containsAiGeneratedContent: manifest.containsAiGeneratedContent,
  };
}

function fillElement(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string | boolean
) {
  if (element instanceof HTMLInputElement && element.type === "checkbox") {
    element.checked = Boolean(value);
    dispatchInputEvents(element);
    return true;
  }

  if (element instanceof HTMLSelectElement) {
    return selectOption(element, value);
  }

  if (typeof value !== "string") {
    return false;
  }

  setNativeValue(element, value);
  dispatchInputEvents(element);
  return true;
}

function selectOption(element: HTMLSelectElement, value: string | boolean) {
  const desired = String(value);
  const option = Array.from(element.options).find((candidate) => {
    const text = `${candidate.textContent ?? ""} ${candidate.value}`.toLowerCase();

    if (typeof value === "boolean") {
      return value
        ? /yes|true|ai|あり|はい|使用|含む/.test(text)
        : /no|false|なし|いいえ|不使用|含まない/.test(text);
    }

    return text.includes(desired.toLowerCase());
  });

  if (!option) {
    return false;
  }

  element.value = option.value;
  dispatchInputEvents(element);
  return true;
}

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype =
    element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");

  if (descriptor?.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }
}

function dispatchInputEvents(element: Element) {
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function classifyField(
  label: string,
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
): FillTarget | undefined {
  const text = normalizeText(`${label} ${element.name} ${element.id} ${element.getAttribute("aria-label") ?? ""}`);
  const isEnglish = /english|英語|en\b|en_|_en|\[en\]/i.test(text);
  const isJapanese = /japanese|日本語|ja\b|ja_|_ja|\[ja\]/i.test(text);

  if (/著作権|コピーライト|copyright|©/i.test(text)) {
    return "copyright";
  }

  if (/クリエイター|creator|author|作者|販売者/i.test(text)) {
    return "creatorName";
  }

  if (/ai|生成ai|人工知能|ai generated|ai-generated/i.test(text)) {
    return "containsAiGeneratedContent";
  }

  if (/説明|紹介|description|desc|summary|コメント/i.test(text)) {
    return isEnglish && !isJapanese ? "description.en" : "description.ja";
  }

  if (/タイトル|スタンプ名|商品名|title|name/i.test(text)) {
    return isEnglish && !isJapanese ? "title.en" : "title.ja";
  }

  return undefined;
}

function isFillableFormElement(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
) {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
    return true;
  }

  return [
    "",
    "text",
    "search",
    "email",
    "url",
    "tel",
    "number",
    "checkbox",
  ].includes(element.type);
}

function isReadOnly(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  return element instanceof HTMLSelectElement ? false : element.readOnly;
}

function isSensitiveElement(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
) {
  if (element instanceof HTMLInputElement && element.type === "password") {
    return true;
  }

  const haystack = normalizeText(
    [
      element.type,
      element.name,
      element.id,
      element.getAttribute("placeholder"),
      element.getAttribute("autocomplete"),
      element.getAttribute("aria-label"),
      getElementLabel(element),
    ].join(" ")
  );

  return sensitiveWords.some((word) => haystack.includes(word.toLowerCase()));
}

function detectLoginPage() {
  if (/\/login|\/signin|\/auth|\/oauth|\/account/i.test(location.pathname)) {
    return true;
  }

  return Array.from(document.querySelectorAll<HTMLInputElement>("input")).some((input) =>
    isSensitiveElement(input)
  );
}

function estimateLoginState(isLoginPage: boolean) {
  if (isLoginPage) {
    return "ログインまたは認証画面の可能性があります";
  }

  const bodyText = normalizeText((document.body.textContent ?? "").slice(0, 20000));

  if (/ログアウト|logout|マイページ|account|dashboard/i.test(bodyText)) {
    return "ログイン済みの可能性があります";
  }

  return "ログイン状態は画面から推定できません";
}

function detectForbiddenButtons() {
  return Array.from(
    document.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLAnchorElement>(
      "button, input[type='submit'], input[type='button'], a, [role='button']"
    )
  )
    .map((element) => normalizeText(elementText(element)))
    .filter((text) => text.length > 0)
    .filter((text) =>
      forbiddenButtonWords.some((word) => text.toLowerCase().includes(word.toLowerCase()))
    )
    .slice(0, 12);
}

function getElementLabel(element: HTMLElement) {
  const id = element.getAttribute("id");
  const explicitLabel = id
    ? document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`)?.textContent
    : "";
  const wrappingLabel = element.closest("label")?.textContent;
  const tableLabel = element.closest("tr")?.querySelector("th, dt")?.textContent;
  const fieldsetLabel = element.closest("fieldset")?.querySelector("legend")?.textContent;
  const parentLabel = element.parentElement?.textContent;
  const candidate =
    explicitLabel ||
    wrappingLabel ||
    element.getAttribute("aria-label") ||
    element.getAttribute("placeholder") ||
    tableLabel ||
    fieldsetLabel ||
    parentLabel ||
    element.getAttribute("name") ||
    element.getAttribute("id") ||
    "未分類の入力欄";

  return compactText(candidate).slice(0, 120);
}

function readCurrentValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  if (element instanceof HTMLInputElement && element.type === "checkbox") {
    return element.checked ? "checked" : "unchecked";
  }

  if (element instanceof HTMLInputElement && element.type === "file") {
    return element.files?.length ? `${element.files.length} files` : "未選択";
  }

  return compactText(element.value).slice(0, 120);
}

function findFieldElement(id: string) {
  return document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    `[data-stampforge-field-id="${CSS.escape(id)}"]`
  );
}

function ensureFieldId(element: HTMLElement) {
  const existing = element.dataset.stampforgeFieldId;

  if (existing) {
    return existing;
  }

  const id = `sf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  element.dataset.stampforgeFieldId = id;
  return id;
}

function isHTMLElementVisible(element: HTMLElement) {
  if (element.hidden) {
    return false;
  }

  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
}

function elementText(element: HTMLElement) {
  if (element instanceof HTMLInputElement) {
    return element.value || element.getAttribute("aria-label") || element.name || "";
  }

  return element.textContent || element.getAttribute("aria-label") || "";
}

function normalizeText(value: string) {
  return compactText(value).toLowerCase();
}

function compactText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function formatLogValue(value: string | boolean) {
  if (typeof value === "boolean") {
    return value ? "あり" : "なし";
  }

  return value.length > 36 ? `${value.slice(0, 36)}...` : value;
}
