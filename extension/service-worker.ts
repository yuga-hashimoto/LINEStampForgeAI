const CREATORS_MARKET_HOST = "creator.line.me";
const DISABLED_PATH_PATTERNS = [
  /\/login/i,
  /\/signin/i,
  /\/auth/i,
  /\/oauth/i,
  /\/account/i,
];

chrome.runtime.onInstalled.addListener(() => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {
    // Older Chrome builds may not expose this promise-shaped API yet.
  });
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  void chrome.tabs.get(tabId).then((tab) => updateSidePanel(tabId, tab.url));
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = changeInfo.url ?? tab.url;

  if (changeInfo.status === "complete" || url) {
    void updateSidePanel(tabId, url);
  }
});

async function updateSidePanel(tabId: number, url: string | undefined) {
  const enabled = isCreatorsMarketPage(url) && !isLoginOrAuthPage(url);

  try {
    await chrome.sidePanel.setOptions({
      tabId,
      path: "sidepanel.html",
      enabled,
    });
  } catch {
    // If the tab has already disappeared, Chrome rejects. There is nothing to persist.
  }
}

function isCreatorsMarketPage(url: string | undefined) {
  if (!url) {
    return false;
  }

  try {
    return new URL(url).hostname === CREATORS_MARKET_HOST;
  } catch {
    return false;
  }
}

function isLoginOrAuthPage(url: string | undefined) {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return DISABLED_PATH_PATTERNS.some((pattern) => pattern.test(parsed.pathname));
  } catch {
    return true;
  }
}
