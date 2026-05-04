"use strict";
(() => {
  // extension/service-worker.ts
  var CREATORS_MARKET_HOST = "creator.line.me";
  var DISABLED_PATH_PATTERNS = [
    /\/login/i,
    /\/signin/i,
    /\/auth/i,
    /\/oauth/i,
    /\/account/i
  ];
  chrome.runtime.onInstalled.addListener(() => {
    void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {
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
  async function updateSidePanel(tabId, url) {
    const enabled = isCreatorsMarketPage(url) && !isLoginOrAuthPage(url);
    try {
      await chrome.sidePanel.setOptions({
        tabId,
        path: "sidepanel.html",
        enabled
      });
    } catch {
    }
  }
  function isCreatorsMarketPage(url) {
    if (!url) {
      return false;
    }
    try {
      return new URL(url).hostname === CREATORS_MARKET_HOST;
    } catch {
      return false;
    }
  }
  function isLoginOrAuthPage(url) {
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
})();
