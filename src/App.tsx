import React, { useEffect, useState } from "react";
import { normalizeUrl } from "./shared/services/urlService";
import type { LockedSite } from "./shared/types/lockedSite";
import "./App.css";

const STORAGE_KEY = "lockedSites";

export type DurationMode = "timed" | "date" | "forever";
export type TimeUnit = "min" | "hr";

interface PresetOption {
  label: string;
  value: number;
  unit: TimeUnit;
}

const PRESETS: PresetOption[] = [
  { label: "15m", value: 15, unit: "min" },
  { label: "30m", value: 30, unit: "min" },
  { label: "1h", value: 1, unit: "hr" },
  { label: "2h", value: 2, unit: "hr" },
  { label: "4h", value: 4, unit: "hr" },
  { label: "8h", value: 8, unit: "hr" },
];

function formatTime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function formatRelativeDiff(targetMs: number): string {
  const diffMs = targetMs - Date.now();
  if (diffMs <= 0) return "Selected time has already passed";
  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);

  if (days > 0) {
    return `in ${days} day${days > 1 ? "s" : ""}${hours > 0 ? `, ${hours} hr${hours > 1 ? "s" : ""}` : ""}`;
  }
  if (hours > 0) {
    return `in ${hours} hr${hours > 1 ? "s" : ""}${minutes > 0 ? `, ${minutes} min` : ""}`;
  }
  return `in ${Math.max(1, minutes)} min`;
}

// Quick Date Helpers
function getEndOfDay(): string {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  return toDatetimeLocal(d);
}

function getTomorrowMorning(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return toDatetimeLocal(d);
}

function getInOneWeek(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return toDatetimeLocal(d);
}

// Icons
const LockSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const TrashSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const GlobeSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ClockSvg = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CalendarSvg = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const InfinitySvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4z" />
    <path d="M12 12c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z" />
  </svg>
);

const App: React.FC = () => {
  const [inputUrl, setInputUrl] = useState("");
  const [mode, setMode] = useState<DurationMode>("timed");

  // Timed settings (Mins / Hours / Custom)
  const [customValue, setCustomValue] = useState("30");
  const [customUnit, setCustomUnit] = useState<TimeUnit>("min");

  // Date settings (Specific date & time)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [untilDate, setUntilDate] = useState(toDatetimeLocal(tomorrow));

  // Storage and tick state
  const [lockedSites, setLockedSites] = useState<Record<string, LockedSite>>({});
  const [now, setNow] = useState(Date.now());

  // Load from chrome.storage
  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      setLockedSites(result[STORAGE_KEY] || {});
    });
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto clean up expired sites
  useEffect(() => {
    const updated = { ...lockedSites };
    let changed = false;
    Object.entries(lockedSites).forEach(([url, site]) => {
      if (site.expiresAt !== null && site.expiresAt <= now) {
        delete updated[url];
        changed = true;
      }
    });
    if (changed) {
      chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => setLockedSites(updated));
    }
  }, [now, lockedSites]);

  // Timed stepper adjusters
  const adjustValue = (delta: number) => {
    const current = parseInt(customValue, 10) || (customUnit === "hr" ? 1 : 15);
    const step = customUnit === "hr" ? 1 : 5;
    const next = Math.max(1, current + delta * step);
    setCustomValue(String(next));
  };

  const handleSelectPreset = (preset: PresetOption) => {
    setCustomValue(String(preset.value));
    setCustomUnit(preset.unit);
  };

  // Check if current custom matches any preset
  const activePreset = PRESETS.find(
    (p) => String(p.value) === customValue && p.unit === customUnit
  );

  // Validate date selection
  const parsedDateMs = mode === "date" ? new Date(untilDate).getTime() : 0;
  const isDateValid = !isNaN(parsedDateMs) && parsedDateMs > Date.now();

  // Validate timed selection
  const parsedTimedNum = parseInt(customValue, 10);
  const isTimedValid = !isNaN(parsedTimedNum) && parsedTimedNum > 0;

  const canAdd =
    inputUrl.trim().length > 0 &&
    (mode === "forever" || (mode === "timed" && isTimedValid) || (mode === "date" && isDateValid));

  const handleAdd = () => {
    const normalized = normalizeUrl(inputUrl);
    if (!normalized || !canAdd) return;

    let expiresAt: number | null = null;

    if (mode === "forever") {
      expiresAt = null;
    } else if (mode === "date") {
      expiresAt = parsedDateMs;
    } else {
      const multiplier = customUnit === "hr" ? 60 * 60 * 1000 : 60 * 1000;
      expiresAt = Date.now() + parsedTimedNum * multiplier;
    }

    const newSite: LockedSite = {
      url: normalized,
      expiresAt,
      createdAt: Date.now(),
      mode,
    };

    const updated = { ...lockedSites, [normalized]: newSite };
    chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
      setLockedSites(updated);
      setInputUrl("");
    });
  };

  const handleDelete = (url: string) => {
    const updated = { ...lockedSites };
    delete updated[url];
    chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => setLockedSites(updated));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canAdd) {
      handleAdd();
    }
  };

  const sites = Object.values(lockedSites);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <LockSvg />
        </div>
        <div className="app-header-text">
          <h1 className="app-title">Locker</h1>
          <p className="app-subtitle">Focus without distractions</p>
        </div>
        {sites.length > 0 && (
          <div className="site-count-badge" title={`${sites.length} site${sites.length > 1 ? "s" : ""} locked`}>
            {sites.length}
          </div>
        )}
      </header>

      {/* Block Form */}
      <section className="form-wrapper">
        {/* URL Input */}
        <div className="input-group">
          <label className="input-label" htmlFor="website-input">Website</label>
          <div className="input-icon-wrap">
            <span className="input-icon">
              <GlobeSvg />
            </span>
            <input
              id="website-input"
              className="text-input"
              type="text"
              placeholder="e.g. youtube.com or reddit.com"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        </div>

        {/* 3 Duration Options */}
        <div className="input-group">
          <label className="input-label">Duration Mode</label>
          <div className="mode-tabs">
            <button
              type="button"
              className={`mode-tab ${mode === "timed" ? "mode-tab--active" : ""}`}
              onClick={() => setMode("timed")}
              title="Block for minutes or hours"
            >
              <ClockSvg />
              <span>Timer</span>
            </button>
            <button
              type="button"
              className={`mode-tab ${mode === "date" ? "mode-tab--active" : ""}`}
              onClick={() => setMode("date")}
              title="Block until a specific date and time"
            >
              <CalendarSvg />
              <span>Until Date</span>
            </button>
            <button
              type="button"
              className={`mode-tab ${mode === "forever" ? "mode-tab--active" : ""}`}
              onClick={() => setMode("forever")}
              title="Block without date until you remove it"
            >
              <InfinitySvg />
              <span>Till Removed</span>
            </button>
          </div>

          {/* ── Option 1: Timed (Mins / Hours / Custom) ── */}
          {mode === "timed" && (
            <div className="mode-panel">
              {/* Preset Chips */}
              <div className="duration-presets">
                {PRESETS.map((p) => {
                  const isSelected = activePreset?.label === p.label;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      className={`duration-chip ${isSelected ? "duration-chip--active" : ""}`}
                      onClick={() => handleSelectPreset(p)}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Stepper with Mins / Hours unit toggle */}
              <div className="custom-stepper-wrap">
                <span className="custom-stepper-label">Custom:</span>
                <div className="stepper-controls">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => adjustValue(-1)}
                    title={`Decrease by 1 ${customUnit === "hr" ? "hour" : "step (5m)"}`}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    className="stepper-input"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                  />
                  <div className="unit-toggle">
                    <button
                      type="button"
                      className={`unit-btn ${customUnit === "min" ? "unit-btn--active" : ""}`}
                      onClick={() => setCustomUnit("min")}
                    >
                      min
                    </button>
                    <button
                      type="button"
                      className={`unit-btn ${customUnit === "hr" ? "unit-btn--active" : ""}`}
                      onClick={() => setCustomUnit("hr")}
                    >
                      hr
                    </button>
                  </div>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => adjustValue(1)}
                    title={`Increase by 1 ${customUnit === "hr" ? "hour" : "step (5m)"}`}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mode-hint">
                <ClockSvg />
                <span>
                  Blocks for{" "}
                  <strong>
                    {parsedTimedNum || 0} {customUnit === "hr" ? (parsedTimedNum === 1 ? "hour" : "hours") : (parsedTimedNum === 1 ? "minute" : "minutes")}
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* ── Option 2: Until Date ── */}
          {mode === "date" && (
            <div className="mode-panel">
              {/* Date Shortcuts for quick selection */}
              <div className="date-shortcuts">
                <button
                  type="button"
                  className="shortcut-chip"
                  onClick={() => setUntilDate(getEndOfDay())}
                >
                  Tonight (11:59 PM)
                </button>
                <button
                  type="button"
                  className="shortcut-chip"
                  onClick={() => setUntilDate(getTomorrowMorning())}
                >
                  Tomorrow 9 AM
                </button>
                <button
                  type="button"
                  className="shortcut-chip"
                  onClick={() => setUntilDate(getInOneWeek())}
                >
                  1 Week
                </button>
              </div>

              {/* Datetime picker */}
              <input
                className="date-input"
                type="datetime-local"
                value={untilDate}
                min={toDatetimeLocal(new Date())}
                onChange={(e) => setUntilDate(e.target.value)}
              />

              <div className={`mode-hint ${!isDateValid ? "mode-hint--warning" : ""}`}>
                <CalendarSvg />
                <span>
                  {isDateValid ? (
                    <>
                      Unblocks on <strong>{formatDate(parsedDateMs)}</strong> ({formatRelativeDiff(parsedDateMs)})
                    </>
                  ) : (
                    "Please select a future date and time"
                  )}
                </span>
              </div>
            </div>
          )}

          {/* ── Option 3: Without date / Till removed (Forever) ── */}
          {mode === "forever" && (
            <div className="mode-panel forever-card">
              <div className="forever-icon">
                <InfinitySvg />
              </div>
              <div className="forever-content">
                <h4 className="forever-title">Block indefinitely</h4>
                <p className="forever-desc">
                  No timer. The site stays locked until you manually remove it from the list below.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Lock Submit Button */}
        <button
          type="button"
          className="btn-lock"
          onClick={handleAdd}
          disabled={!canAdd}
        >
          <LockSvg />
          <span>Block Site</span>
        </button>
      </section>

      {/* Blocked Sites List */}
      <section className="sites-section">
        {sites.length > 0 ? (
          <ul className="site-list">
            {sites.map((site) => {
              const { url, expiresAt, createdAt } = site;
              const isForever = expiresAt === null;
              const secondsLeft = isForever ? 0 : Math.max(0, Math.floor((expiresAt! - now) / 1000));

              // Compute progress percentage
              let progress = 100;
              if (!isForever) {
                const totalSec = createdAt
                  ? Math.max(1, Math.floor((expiresAt! - createdAt) / 1000))
                  : Math.max(1, Math.floor((expiresAt! - (now - secondsLeft * 1000)) / 1000));
                progress = Math.max(0, Math.min(100, (secondsLeft / totalSec) * 100));
              }

              const isDateMode = site.mode === "date" || (expiresAt !== null && (expiresAt - now > 24 * 3600 * 1000));

              return (
                <li key={url} className="site-item">
                  <div className="site-item-main">
                    <div className="site-info">
                      <span className="site-url" title={url}>
                        {url}
                      </span>
                      <span className={`site-badge ${isForever ? "site-badge--forever" : isDateMode ? "site-badge--date" : "site-badge--timer"}`}>
                        {isForever ? (
                          <>
                            <InfinitySvg /> Till removed
                          </>
                        ) : isDateMode ? (
                          <>
                            <CalendarSvg /> Until {formatDate(expiresAt!)}
                          </>
                        ) : (
                          <>
                            <ClockSvg /> {formatTime(secondsLeft)}
                          </>
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => handleDelete(url)}
                      title="Remove block"
                    >
                      <TrashSvg />
                    </button>
                  </div>

                  <div className="timer-bar">
                    <div
                      className={`timer-bar-fill ${isForever ? "timer-bar-fill--forever" : ""}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">🔓</span>
            <p>No sites currently blocked</p>
            <span>Add a website above to stay productive</span>
          </div>
        )}
      </section>
    </div>
  );
};

export default App;
