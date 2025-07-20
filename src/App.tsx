import { useEffect, useState } from "react";
import "./App.css";
import { STORAGE_KEY } from "./shared/constants/storageConstants";
import type { LockedSite } from "./shared/types/lockedSite";
import { normalizeUrl } from "./shared/services/urlService";

export default function App() {
  const [lockedSites, setLockedSites] = useState<Record<string, LockedSite>>(
    {}
  );
  const [newUrl, setNewUrl] = useState("");
  const [minutes, setMinutes] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        const sites = result[STORAGE_KEY] || {};
        const now = Date.now();
        const updatedSites: Record<string, LockedSite> = {};

        Object.entries(sites).forEach(([url, data]) => {
          const site = data as LockedSite;
          if (site.until > now) {
            updatedSites[url] = site;
          }
        });

        setLockedSites(updatedSites);
        chrome.storage.local.set({ [STORAGE_KEY]: updatedSites });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAddSite = () => {
    if (!newUrl) return;
    const normalized = normalizeUrl(newUrl);

    const until = Date.now() + minutes * 60 * 1000;
    const updated = {
      ...lockedSites,
      [normalized]: { url: normalized, until },
    };

    setLockedSites(updated);
    chrome.storage.local.set({ [STORAGE_KEY]: updated });

    setNewUrl("");
  };

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="app-container">
      <h2>🔒 Site Locker</h2>

      <div className="form-section">
        <input
          type="text"
          placeholder="Enter site URL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
        />
        <input
          type="number"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          min={1}
        />
        <button onClick={handleAddSite}>Lock</button>
      </div>

      <div className="locked-list">
        <h3>Locked Sites</h3>
        {Object.entries(lockedSites).length === 0 && <p>No locked sites.</p>}
        <ul>
          {Object.entries(lockedSites).map(([url, { until }]) => (
            <li key={url}>
              <strong>{url}</strong>
              <div>⏱ {formatCountdown(until - Date.now())}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

