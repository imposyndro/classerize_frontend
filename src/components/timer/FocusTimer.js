"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

const MODES = {
    work:       { label: "Focus",       minutes: 25, color: "#4F46E5" },
    shortBreak: { label: "Short break", minutes: 5,  color: "#10B981" },
    longBreak:  { label: "Long break",  minutes: 15, color: "#F59E0B" },
};

function pad(n) { return String(n).padStart(2, "0"); }

export default function FocusTimer() {
    const { user } = useAuth();
    const [open, setOpen]         = useState(false);
    const [mode, setMode]         = useState("work");
    const [secondsLeft, setLeft]  = useState(MODES.work.minutes * 60);
    const [running, setRunning]   = useState(false);
    const [pomodorosDone, setDone] = useState(0);
    const [assignments, setAssignments] = useState([]);
    const [selectedId, setSelectedId]   = useState("");
    const intervalRef = useRef(null);
    const startRef    = useRef(null);   // seconds when started, to compute elapsed
    const elapsedRef  = useRef(0);

    useEffect(() => {
        if (!user) return;
        apiClient.get("/api/assignments?status=pending&limit=20")
            .then(async (res) => { if (res?.ok) { const d = await res.json(); setAssignments(d.assignments || []); } });
    }, [user]);

    const stopTimer = useCallback(() => {
        clearInterval(intervalRef.current);
        setRunning(false);
    }, []);

    const logSession = useCallback(async (minutes) => {
        if (minutes < 1) return;
        await apiClient.post("/api/focus/sessions", {
            assignment_id:    selectedId ? Number(selectedId) : undefined,
            duration_minutes: minutes,
        }).catch(() => {});
    }, [selectedId]);

    const switchMode = useCallback((newMode) => {
        stopTimer();
        elapsedRef.current = 0;
        setMode(newMode);
        setLeft(MODES[newMode].minutes * 60);
    }, [stopTimer]);

    // Timer tick
    useEffect(() => {
        if (running) {
            startRef.current = Date.now();
            intervalRef.current = setInterval(() => {
                setLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        setRunning(false);
                        const totalElapsed = elapsedRef.current + MODES[mode].minutes;
                        elapsedRef.current = 0;
                        if (mode === "work") {
                            logSession(MODES[mode].minutes);
                            setDone((d) => d + 1);
                            // Play a soft beep via AudioContext
                            try {
                                const ctx = new AudioContext();
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();
                                osc.connect(gain); gain.connect(ctx.destination);
                                osc.frequency.value = 528;
                                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
                                osc.start(); osc.stop(ctx.currentTime + 1.5);
                            } catch {}
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [running, mode, logSession]);

    // Update browser tab title while running
    useEffect(() => {
        if (running && open) {
            const m = Math.floor(secondsLeft / 60);
            const s = secondsLeft % 60;
            document.title = `[${pad(m)}:${pad(s)}] Classerize`;
        } else {
            document.title = "Classerize — Your Unified Learning Dashboard";
        }
        return () => { document.title = "Classerize — Your Unified Learning Dashboard"; };
    }, [running, open, secondsLeft]);

    if (!user) return null;

    const currentMode = MODES[mode];
    const pct = secondsLeft / (currentMode.minutes * 60);
    const circumference = 2 * Math.PI * 36;

    return (
        <>
            {/* Floating trigger button */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white text-xl transition hover:scale-105"
                    style={{ backgroundColor: currentMode.color }}
                    title="Focus Timer"
                >
                    {running ? "⏸" : "⏱"}
                    {running && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    )}
                </button>
            )}

            {/* Timer panel */}
            {open && (
                <div className="fixed bottom-6 right-6 z-40 bg-white rounded-2xl shadow-2xl w-72 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-700">Focus Timer</span>
                        <div className="flex items-center gap-2">
                            {pomodorosDone > 0 && (
                                <span className="text-xs text-orange-500 font-medium">🍅 ×{pomodorosDone}</span>
                            )}
                            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
                        </div>
                    </div>

                    {/* Mode tabs */}
                    <div className="flex border-b border-gray-100">
                        {Object.entries(MODES).map(([key, m]) => (
                            <button key={key} onClick={() => switchMode(key)}
                                    className={`flex-1 text-xs py-1.5 font-medium transition ${mode === key ? "text-white" : "text-gray-500 hover:text-gray-700"}`}
                                    style={mode === key ? { backgroundColor: m.color } : {}}>
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Timer face */}
                    <div className="flex flex-col items-center py-5 px-4">
                        <div className="relative w-24 h-24 mb-3">
                            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                                <circle cx="40" cy="40" r="36" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                                <circle cx="40" cy="40" r="36" fill="none"
                                        stroke={currentMode.color} strokeWidth="6"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={circumference * (1 - pct)}
                                        strokeLinecap="round"
                                        style={{ transition: "stroke-dashoffset 1s linear" }} />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl font-bold text-gray-800 tabular-nums">
                                    {pad(Math.floor(secondsLeft / 60))}:{pad(secondsLeft % 60)}
                                </span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-3 mb-4">
                            <button
                                onClick={() => setRunning(!running)}
                                className="px-5 py-1.5 rounded-full text-white text-sm font-semibold shadow transition hover:opacity-90"
                                style={{ backgroundColor: currentMode.color }}
                            >
                                {running ? "Pause" : secondsLeft < currentMode.minutes * 60 ? "Resume" : "Start"}
                            </button>
                            <button
                                onClick={() => switchMode(mode)}
                                className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm hover:bg-gray-200"
                            >
                                Reset
                            </button>
                        </div>

                        {/* Assignment picker */}
                        <div className="w-full">
                            <label className="text-xs text-gray-400 mb-1 block">Studying for…</label>
                            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
                                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400">
                                <option value="">General focus</option>
                                {assignments.map((a) => (
                                    <option key={a.assignment_id} value={a.assignment_id}>
                                        {a.assignment_name.slice(0, 35)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
