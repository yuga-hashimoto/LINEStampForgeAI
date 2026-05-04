"use strict";
(() => {
  // extension/content-script.ts
  var forbiddenButtonWords = [
    "\u7533\u8ACB",
    "\u8CA9\u58F2\u7533\u8ACB",
    "request review",
    "submit",
    "\u9001\u4FE1",
    "\u78BA\u5B9A",
    "\u516C\u958B",
    "\u8CFC\u5165",
    "\u6C7A\u6E08"
  ];
  var sensitiveWords = [
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
    "\u30D1\u30B9\u30EF\u30FC\u30C9",
    "\u8A8D\u8A3C\u30B3\u30FC\u30C9",
    "\u78BA\u8A8D\u30B3\u30FC\u30C9",
    "\u4E8C\u6BB5\u968E",
    "\u30EF\u30F3\u30BF\u30A4\u30E0"
  ];
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    void handleMessage(message).then(sendResponse).catch((error) => {
      sendResponse({
        ok: false,
        warnings: [error instanceof Error ? error.message : "Unknown content script error"]
      });
    });
    return true;
  });
  async function handleMessage(message) {
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
      warnings: ["Unsupported message type"]
    };
  }
  function scanPage() {
    const isLoginPage = detectLoginPage();
    const fields = collectFields(false);
    const fileInputs = collectFields(true);
    const forbiddenButtons = detectForbiddenButtons();
    const warnings = [];
    if (isLoginPage) {
      warnings.push("\u30ED\u30B0\u30A4\u30F3\u307E\u305F\u306F\u8A8D\u8A3C\u753B\u9762\u306E\u53EF\u80FD\u6027\u304C\u3042\u308B\u305F\u3081\u3001\u3053\u306E\u30DA\u30FC\u30B8\u3067\u306F\u7121\u52B9\u3067\u3059\u3002");
    }
    if (!isLoginPage && fields.length === 0 && fileInputs.length === 0) {
      warnings.push("\u5165\u529B\u53EF\u80FD\u306A\u30D5\u30A9\u30FC\u30E0\u3092\u691C\u51FA\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002Creators Market\u306EDOM\u5909\u66F4\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    }
    if (forbiddenButtons.length > 0) {
      warnings.push("\u7533\u8ACB\u30FB\u9001\u4FE1\u7CFB\u306E\u30DC\u30BF\u30F3\u3092\u691C\u51FA\u3057\u307E\u3057\u305F\u3002\u62E1\u5F35\u6A5F\u80FD\u306F\u3053\u308C\u3089\u3092\u81EA\u52D5\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u305B\u3093\u3002");
    }
    return {
      ok: warnings.length === 0 || !isLoginPage && fields.length > 0,
      url: location.href,
      loginState: estimateLoginState(isLoginPage),
      isLoginPage,
      fields,
      fileInputs,
      forbiddenButtons,
      warnings
    };
  }
  function collectFields(fileOnly) {
    return Array.from(document.querySelectorAll(
      "input, textarea, select"
    )).filter((element) => {
      if (!isHTMLElementVisible(element) || element.disabled || isReadOnly(element)) {
        return false;
      }
      if (isSensitiveElement(element)) {
        return false;
      }
      const isFile = element instanceof HTMLInputElement && element.type === "file";
      return fileOnly ? isFile : isFillableFormElement(element) && !isFile;
    }).map((element) => {
      const label = getElementLabel(element);
      return {
        id: ensureFieldId(element),
        label,
        tagName: element.tagName.toLowerCase(),
        type: element instanceof HTMLInputElement ? element.type || "text" : element.tagName.toLowerCase(),
        target: fileOnly ? void 0 : classifyField(label, element),
        required: element.required,
        currentValue: readCurrentValue(element)
      };
    });
  }
  function applyManifest(manifest) {
    const page = scanPage();
    if (page.isLoginPage) {
      return {
        ok: false,
        filled: [],
        skipped: [],
        logs: ["\u30ED\u30B0\u30A4\u30F3\u307E\u305F\u306F\u8A8D\u8A3C\u753B\u9762\u306E\u305F\u3081\u81EA\u52D5\u5165\u529B\u3092\u505C\u6B62\u3057\u307E\u3057\u305F\u3002"],
        warnings: page.warnings
      };
    }
    if (page.fields.length === 0) {
      return {
        ok: false,
        filled: [],
        skipped: [],
        logs: [],
        warnings: ["\u5165\u529B\u6B04\u3092\u691C\u51FA\u3067\u304D\u306A\u3044\u305F\u3081\u505C\u6B62\u3057\u307E\u3057\u305F\u3002Creators Market\u306E\u753B\u9762\u69CB\u9020\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"]
      };
    }
    const values = buildManifestValues(manifest);
    const filled = [];
    const skipped = [];
    const logs = [];
    page.fields.forEach((field) => {
      if (!field.target) {
        skipped.push(`${field.label}: \u5BFE\u5FDC\u3059\u308B\u7533\u8ACB\u30D1\u30C3\u30AF\u9805\u76EE\u306A\u3057`);
        return;
      }
      const element = findFieldElement(field.id);
      if (!element || isSensitiveElement(element)) {
        skipped.push(`${field.label}: \u5165\u529B\u6B04\u3092\u518D\u691C\u51FA\u3067\u304D\u306A\u3044\u305F\u3081\u30B9\u30AD\u30C3\u30D7`);
        return;
      }
      const value = values[field.target];
      const applied = fillElement(element, value);
      if (applied) {
        filled.push(field.label);
        logs.push(`${field.label} \u306B ${formatLogValue(value)} \u3092\u5165\u529B\u3057\u307E\u3057\u305F\u3002`);
      } else {
        skipped.push(`${field.label}: \u81EA\u52D5\u5165\u529B\u3067\u304D\u306A\u3044\u5F62\u5F0F\u3067\u3059`);
      }
    });
    return {
      ok: filled.length > 0,
      filled,
      skipped,
      logs,
      warnings: [
        ...page.warnings,
        "\u7533\u8ACB\u30FB\u9001\u4FE1\u30FB\u516C\u958B\u306A\u3069\u306E\u6700\u7D42\u64CD\u4F5C\u306F\u81EA\u52D5\u5316\u3057\u3066\u3044\u307E\u305B\u3093\u3002\u5165\u529B\u5185\u5BB9\u3092\u78BA\u8A8D\u3057\u3066\u304B\u3089\u30E6\u30FC\u30B6\u30FC\u81EA\u8EAB\u3067\u9032\u3081\u3066\u304F\u3060\u3055\u3044\u3002"
      ]
    };
  }
  function runPreflight(manifest) {
    const page = scanPage();
    const warnings = [...page.warnings];
    if (manifest) {
      if (manifest.stickerType !== "static") {
        warnings.push("\u9759\u6B62\u753B\u30B9\u30BF\u30F3\u30D7\u4EE5\u5916\u306E\u7533\u8ACB\u30D1\u30C3\u30AF\u306F\u6271\u3048\u307E\u305B\u3093\u3002");
      }
      if (!manifest.zipUrl) {
        warnings.push("ZIP URL\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u5B89\u5168\u65B9\u5F0F\u3067\u624B\u52D5\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
      }
      if (manifest.checks.advertisingRisk) {
        warnings.push("\u5E83\u544A\u76EE\u7684\u3068\u5224\u65AD\u3055\u308C\u308B\u53EF\u80FD\u6027\u304C\u3042\u308B\u9805\u76EE\u304C\u3042\u308A\u307E\u3059\u3002");
      }
      if (manifest.checks.rightsRisk) {
        warnings.push("\u6A29\u5229\u78BA\u8A8D\u304C\u5FC5\u8981\u306A\u9805\u76EE\u304C\u3042\u308A\u307E\u3059\u3002");
      }
    }
    return {
      ok: !page.isLoginPage && page.fields.length > 0,
      page,
      warnings,
      nextAction: "\u6700\u7D42\u7533\u8ACB\u30DC\u30BF\u30F3\u306F\u62E1\u5F35\u6A5F\u80FD\u3067\u306F\u62BC\u3057\u307E\u305B\u3093\u3002Creators Market\u4E0A\u3067\u30E6\u30FC\u30B6\u30FC\u304C\u5185\u5BB9\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
    };
  }
  async function tryExperimentalZipUpload(manifest) {
    const page = scanPage();
    if (page.isLoginPage) {
      return {
        ok: false,
        fallbackRequired: true,
        logs: ["\u30ED\u30B0\u30A4\u30F3\u307E\u305F\u306F\u8A8D\u8A3C\u753B\u9762\u3067\u306FZIP\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u88DC\u52A9\u3092\u7121\u52B9\u5316\u3057\u307E\u3057\u305F\u3002"]
      };
    }
    const fileInput = Array.from(document.querySelectorAll("input[type='file']")).filter((element) => isHTMLElementVisible(element) && !isSensitiveElement(element)).find((element) => /zip|ファイル|アップロード|upload/i.test(getElementLabel(element)));
    if (!fileInput) {
      return {
        ok: false,
        fallbackRequired: true,
        logs: ["ZIP\u7528\u306E\u30D5\u30A1\u30A4\u30EB\u9078\u629E\u6B04\u3092\u691C\u51FA\u3067\u304D\u307E\u305B\u3093\u3002\u5B89\u5168\u65B9\u5F0F\u3067\u624B\u52D5\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002"]
      };
    }
    if (!manifest.zipUrl) {
      return {
        ok: false,
        fallbackRequired: true,
        logs: ["\u7533\u8ACB\u30D1\u30C3\u30AF\u306BZIP URL\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u5B89\u5168\u65B9\u5F0F\u3067\u624B\u52D5\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002"]
      };
    }
    try {
      const response = await fetch(manifest.zipUrl, { credentials: "omit" });
      if (!response.ok) {
        throw new Error(`ZIP fetch failed: ${response.status}`);
      }
      const blob = await response.blob();
      const file = new File([blob], `${manifest.projectId}-submission-pack.zip`, {
        type: "application/zip"
      });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      dispatchInputEvents(fileInput);
      return {
        ok: true,
        fallbackRequired: false,
        logs: ["\u5B9F\u9A13\u65B9\u5F0F\u3067ZIP\u30D5\u30A1\u30A4\u30EB\u3092\u30D5\u30A1\u30A4\u30EB\u9078\u629E\u6B04\u306B\u30BB\u30C3\u30C8\u3057\u307E\u3057\u305F\u3002\u9001\u4FE1\u306F\u884C\u3063\u3066\u3044\u307E\u305B\u3093\u3002"]
      };
    } catch (error) {
      return {
        ok: false,
        fallbackRequired: true,
        logs: [
          "\u5B9F\u9A13\u65B9\u5F0F\u306EZIP\u30BB\u30C3\u30C8\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u5B89\u5168\u65B9\u5F0F\u3068\u3057\u3066\u3001Web\u30A2\u30D7\u30EA\u3067ZIP\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u3066\u624B\u52D5\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
          error instanceof Error ? error.message : "Unknown upload error"
        ]
      };
    }
  }
  function buildManifestValues(manifest) {
    return {
      "title.ja": manifest.title.ja,
      "title.en": manifest.title.en ?? "",
      "description.ja": manifest.description.ja,
      "description.en": manifest.description.en ?? "",
      creatorName: manifest.creatorName,
      copyright: manifest.copyright,
      containsAiGeneratedContent: manifest.containsAiGeneratedContent
    };
  }
  function fillElement(element, value) {
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
  function selectOption(element, value) {
    const desired = String(value);
    const option = Array.from(element.options).find((candidate) => {
      const text = `${candidate.textContent ?? ""} ${candidate.value}`.toLowerCase();
      if (typeof value === "boolean") {
        return value ? /yes|true|ai|あり|はい|使用|含む/.test(text) : /no|false|なし|いいえ|不使用|含まない/.test(text);
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
  function setNativeValue(element, value) {
    const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
    if (descriptor?.set) {
      descriptor.set.call(element, value);
    } else {
      element.value = value;
    }
  }
  function dispatchInputEvents(element) {
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function classifyField(label, element) {
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
    return void 0;
  }
  function isFillableFormElement(element) {
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
      "checkbox"
    ].includes(element.type);
  }
  function isReadOnly(element) {
    return element instanceof HTMLSelectElement ? false : element.readOnly;
  }
  function isSensitiveElement(element) {
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
        getElementLabel(element)
      ].join(" ")
    );
    return sensitiveWords.some((word) => haystack.includes(word.toLowerCase()));
  }
  function detectLoginPage() {
    if (/\/login|\/signin|\/auth|\/oauth|\/account/i.test(location.pathname)) {
      return true;
    }
    return Array.from(document.querySelectorAll("input")).some(
      (input) => isSensitiveElement(input)
    );
  }
  function estimateLoginState(isLoginPage) {
    if (isLoginPage) {
      return "\u30ED\u30B0\u30A4\u30F3\u307E\u305F\u306F\u8A8D\u8A3C\u753B\u9762\u306E\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059";
    }
    const bodyText = normalizeText((document.body.textContent ?? "").slice(0, 2e4));
    if (/ログアウト|logout|マイページ|account|dashboard/i.test(bodyText)) {
      return "\u30ED\u30B0\u30A4\u30F3\u6E08\u307F\u306E\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059";
    }
    return "\u30ED\u30B0\u30A4\u30F3\u72B6\u614B\u306F\u753B\u9762\u304B\u3089\u63A8\u5B9A\u3067\u304D\u307E\u305B\u3093";
  }
  function detectForbiddenButtons() {
    return Array.from(
      document.querySelectorAll(
        "button, input[type='submit'], input[type='button'], a, [role='button']"
      )
    ).map((element) => normalizeText(elementText(element))).filter((text) => text.length > 0).filter(
      (text) => forbiddenButtonWords.some((word) => text.toLowerCase().includes(word.toLowerCase()))
    ).slice(0, 12);
  }
  function getElementLabel(element) {
    const id = element.getAttribute("id");
    const explicitLabel = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent : "";
    const wrappingLabel = element.closest("label")?.textContent;
    const tableLabel = element.closest("tr")?.querySelector("th, dt")?.textContent;
    const fieldsetLabel = element.closest("fieldset")?.querySelector("legend")?.textContent;
    const parentLabel = element.parentElement?.textContent;
    const candidate = explicitLabel || wrappingLabel || element.getAttribute("aria-label") || element.getAttribute("placeholder") || tableLabel || fieldsetLabel || parentLabel || element.getAttribute("name") || element.getAttribute("id") || "\u672A\u5206\u985E\u306E\u5165\u529B\u6B04";
    return compactText(candidate).slice(0, 120);
  }
  function readCurrentValue(element) {
    if (element instanceof HTMLInputElement && element.type === "checkbox") {
      return element.checked ? "checked" : "unchecked";
    }
    if (element instanceof HTMLInputElement && element.type === "file") {
      return element.files?.length ? `${element.files.length} files` : "\u672A\u9078\u629E";
    }
    return compactText(element.value).slice(0, 120);
  }
  function findFieldElement(id) {
    return document.querySelector(
      `[data-stampforge-field-id="${CSS.escape(id)}"]`
    );
  }
  function ensureFieldId(element) {
    const existing = element.dataset.stampforgeFieldId;
    if (existing) {
      return existing;
    }
    const id = `sf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    element.dataset.stampforgeFieldId = id;
    return id;
  }
  function isHTMLElementVisible(element) {
    if (element.hidden) {
      return false;
    }
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
  }
  function elementText(element) {
    if (element instanceof HTMLInputElement) {
      return element.value || element.getAttribute("aria-label") || element.name || "";
    }
    return element.textContent || element.getAttribute("aria-label") || "";
  }
  function normalizeText(value) {
    return compactText(value).toLowerCase();
  }
  function compactText(value) {
    return (value ?? "").replace(/\s+/g, " ").trim();
  }
  function formatLogValue(value) {
    if (typeof value === "boolean") {
      return value ? "\u3042\u308A" : "\u306A\u3057";
    }
    return value.length > 36 ? `${value.slice(0, 36)}...` : value;
  }
})();
