import React, { useState } from "react";

type ScheduleEntry = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  type: "block" | "allow";
};

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PlusSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashSvg = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
  </svg>
);

const SchedulePage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState("Mon");
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);

  const handleAddSchedule = () => {
    const newEntry: ScheduleEntry = {
      id: Date.now().toString(),
      day: selectedDay,
      startTime: "09:00",
      endTime: "17:00",
      type: "block",
    };
    setSchedules((prev) => [...prev, newEntry]);
  };

  const updateSchedule = (id: string, key: keyof ScheduleEntry, value: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: value } : s))
    );
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const schedulesForSelectedDay = schedules.filter((s) => s.day === selectedDay);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      width: "340px",
      padding: "14px",
      background: "linear-gradient(165deg, #1a1d2e, #161929)",
      minHeight: "200px",
      fontFamily: "'Inter', system-ui, sans-serif",
      colorScheme: "dark",
    }}>
      {/* Header */}
      <div style={{ paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.14)" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "rgba(255,255,255,0.92)", margin: 0, letterSpacing: "-0.3px" }}>
          Daily Schedule
        </h2>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
          Set time-based blocking rules
        </p>
      </div>

      {/* Day Selector */}
      <div style={{ display: "flex", gap: "4px" }}>
        {daysOfWeek.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            style={{
              flex: 1,
              padding: "5px 0",
              borderRadius: "6px",
              border: selectedDay === day ? "1px solid #a78bfa" : "1px solid rgba(255,255,255,0.15)",
              background: selectedDay === day ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.07)",
              color: selectedDay === day ? "#c4b5fd" : "rgba(255,255,255,0.65)",
              fontSize: "11px",
              fontWeight: selectedDay === day ? 600 : 400,
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: selectedDay === day ? "0 0 8px rgba(167,139,250,0.25)" : "none",
            }}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule Entries */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" }}>
        {schedulesForSelectedDay.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "20px 16px", color: "rgba(255,255,255,0.3)", fontSize: "12px", textAlign: "center", gap: "4px",
          }}>
            <span style={{ fontSize: "20px" }}>📅</span>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>No schedules for {selectedDay}</span>
            <span>Add a rule below</span>
          </div>
        ) : (
          schedulesForSelectedDay.map((schedule) => (
            <div key={schedule.id} style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: "10px",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "border-color 0.15s ease",
            }}>
              {/* Time range */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
                <input
                  type="time"
                  value={schedule.startTime}
                  onChange={(e) => updateSchedule(schedule.id, "startTime", e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: "6px",
                    padding: "4px 7px",
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.9)",
                    fontFamily: "inherit",
                    outline: "none",
                    colorScheme: "dark",
                  }}
                />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>→</span>
                <input
                  type="time"
                  value={schedule.endTime}
                  onChange={(e) => updateSchedule(schedule.id, "endTime", e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: "6px",
                    padding: "4px 7px",
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.9)",
                    fontFamily: "inherit",
                    outline: "none",
                    colorScheme: "dark",
                  }}
                />
              </div>

              {/* Type toggle */}
              <select
                value={schedule.type}
                onChange={(e) => updateSchedule(schedule.id, "type", e.target.value as "block" | "allow")}
                style={{
                  background: schedule.type === "block" ? "rgba(248,113,113,0.12)" : "rgba(52,211,153,0.12)",
                  border: `1px solid ${schedule.type === "block" ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.3)"}`,
                  borderRadius: "6px",
                  padding: "4px 6px",
                  fontSize: "11px",
                  color: schedule.type === "block" ? "#f87171" : "#34d399",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                  colorScheme: "dark",
                }}
              >
                <option value="block">Block</option>
                <option value="allow">Allow</option>
              </select>

              {/* Delete */}
              <button
                onClick={() => deleteSchedule(schedule.id)}
                title="Remove"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "24px", height: "24px",
                  borderRadius: "5px", border: "none",
                  background: "transparent", color: "rgba(255,255,255,0.25)",
                  cursor: "pointer", transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.1)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.25)";
                }}
              >
                <TrashSvg />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add button */}
      <button
        onClick={handleAddSchedule}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          padding: "8px 14px",
          borderRadius: "10px", border: "none",
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          color: "#fff",
          fontFamily: "inherit", fontSize: "13px", fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
          transition: "all 0.25s ease",
          letterSpacing: "0.01em",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 18px rgba(124,58,237,0.5)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(124,58,237,0.35)";
        }}
      >
        <PlusSvg />
        Add Schedule
      </button>
    </div>
  );
};

export default SchedulePage;

