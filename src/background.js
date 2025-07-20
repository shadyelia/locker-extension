import { STORAGE_KEY } from "./shared/constants/storageConstants";
import { normalizeUrl } from "./shared/services/urlService";

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const currentHostname = normalizeUrl(tab.url);

  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const lockedSites = result.lockedSites || {};

    if (lockedSites[currentHostname]) {
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL("blocked.html"),
      });
    }
  });
});
