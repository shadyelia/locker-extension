const STORAGE_KEY = 'lockedSites';

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;

  const url = new URL(tab.url);
  const domain = url.hostname;

  chrome.storage.local.get(['lockedSites'], (result) => {
    const lockedSites = result.lockedSites || {};
    const unlockTime = lockedSites[domain];
    const isLocked = unlockTime && Date.now() < unlockTime;

    if (isLocked) {
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL('blocked.html'),
      });
    }
  });
});

