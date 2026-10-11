import { STORAGE_KEY } from "./shared/constants/storageConstants";
import { normalizeUrl } from "./shared/services/urlService";

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const currentHostname = normalizeUrl(tab.url);

  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const lockedSites = result.lockedSites || {};
    const site = lockedSites[currentHostname];

    if (!site) return;

    // null = permanent block (never expires)
    const isExpired = site.expiresAt !== null && site.expiresAt <= Date.now();

    if (isExpired) {
      // Clean up expired entry
      const updated = { ...lockedSites };
      delete updated[currentHostname];
      chrome.storage.local.set({ [STORAGE_KEY]: updated });
      return;
    }

    chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL("blocked.html"),
    });
  });
});

