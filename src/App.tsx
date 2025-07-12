import { useEffect, useState } from "react";


const STORAGE_KEY = "lockedSites";

function App() {
  const [domain, setDomain] = useState("");
  const [minutes, setMinutes] = useState(60);
  const [lockedSites, setLockedSites] = useState<Record<string, number>>({});

  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      setLockedSites(result[STORAGE_KEY] || {});
    });
  }, []);

  const saveLockedSites = (sites: Record<string, number>) => {
    chrome.storage.local.set({ [STORAGE_KEY]: sites });
    setLockedSites(sites);
  };

  const handleLock = () => {
    if (!domain) return;

    const unlockTime = Date.now() + minutes * 60_000;
    const updated = {
      ...lockedSites,
      [domain]: unlockTime,
    };

    saveLockedSites(updated);
    setDomain("");
    setMinutes(60);
  };

  const getRemainingTime = (unlockTime: number) => {
    const remaining = unlockTime - Date.now();
    if (remaining <= 0) return "Unlocked";
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const handleUnlock = (site: string) => {
    const updated = { ...lockedSites };
    delete updated[site];
    saveLockedSites(updated);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>🔒 Locker</h2>

      <input
        placeholder="e.g. www.facebook.com"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        type="number"
        min={1}
        value={minutes}
        onChange={(e) => setMinutes(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={handleLock} style={{ width: "100%" }}>
        Lock for {minutes} minutes
      </button>

      <h3 style={{ marginTop: 30 }}>Locked Sites</h3>
      <ul>
        {Object.entries(lockedSites).map(([site, unlockTime]) => (
          <li key={site} style={{ marginBottom: 10 }}>
            <strong>{site}</strong> — {getRemainingTime(unlockTime)}
            {Date.now() < unlockTime && (
              <button
                style={{ marginLeft: 10 }}
                onClick={() => handleUnlock(site)}
              >
                Unlock
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
