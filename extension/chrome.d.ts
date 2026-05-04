type ChromeMessageCallback<T = unknown> = (response: T) => void;

declare const chrome: {
  runtime: {
    lastError?: { message?: string };
    onInstalled: {
      addListener(callback: () => void): void;
    };
    onMessage: {
      addListener(
        callback: (
          message: unknown,
          sender: unknown,
          sendResponse: ChromeMessageCallback
        ) => boolean | void
      ): void;
    };
  };
  sidePanel: {
    setPanelBehavior(options: { openPanelOnActionClick: boolean }): Promise<void>;
    setOptions(options: { tabId?: number; path?: string; enabled: boolean }): Promise<void>;
  };
  storage: {
    local: {
      get(keys?: string | string[] | Record<string, unknown> | null): Promise<Record<string, unknown>>;
      set(values: Record<string, unknown>): Promise<void>;
    };
  };
  tabs: {
    get(tabId: number): Promise<{ id?: number; url?: string }>;
    query(queryInfo: { active?: boolean; currentWindow?: boolean }): Promise<Array<{ id?: number; url?: string }>>;
    sendMessage<T = unknown>(tabId: number, message: unknown, callback?: ChromeMessageCallback<T>): void;
    onActivated: {
      addListener(callback: (activeInfo: { tabId: number }) => void): void;
    };
    onUpdated: {
      addListener(
        callback: (
          tabId: number,
          changeInfo: { status?: string; url?: string },
          tab: { id?: number; url?: string }
        ) => void
      ): void;
    };
  };
};
