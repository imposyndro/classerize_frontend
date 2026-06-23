"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { withAuth, useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

const TABS = ["Linked Accounts", "Notifications", "AI", "Schedule", "Connected Services"];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MODEL_LABELS = {
    "gemini-2.5-flash-lite-preview-06-17": "Gemini 2.5 Flash-Lite (cheapest)",
    "gemini-2.5-flash": "Gemini 2.5 Flash (balanced)",
    "gemini-2.5-pro": "Gemini 2.5 Pro (most capable)",
};

const INPUT = "w-full bg-surface text-ink border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand";

function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("Linked Accounts");
    const [accounts, setAccounts] = useState([]);
    const [notifPrefs, setNotifPrefs] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Redirect feedback (e.g. ?connected=calendar)
    const [globalMessage, setGlobalMessage] = useState(null);
    useEffect(() => {
        const params = useSearchParams();
        if (params.get("connected") === "calendar") {
            setGlobalMessage({ type: "success", text: "Google Calendar connected!" });
            setActiveTab("Connected Services");
            window.history.replaceState({}, "", "/settings");
        } else if (params.get("error") === "calendar_auth_failed") {
            setGlobalMessage({ type: "error", text: "Google Calendar connection failed. Please try again." });
            setActiveTab("Connected Services");
            window.history.replaceState({}, "", "/settings");
        }
    }, []);

    // AI settings state
    const [aiSettings, setAISettings] = useState(null);
    const [byokKey, setByokKey] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [aiSaving, setAISaving] = useState(false);
    const [aiMessage, setAIMessage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const [acctRes, notifRes] = await Promise.all([
                apiClient.get("/api/linked-accounts"),
                apiClient.get("/api/notifications/preferences"),
            ]);
            if (acctRes?.ok) setAccounts(await acctRes.json());
            if (notifRes?.ok) setNotifPrefs(await notifRes.json());
        };
        fetchData();
    }, []);

    // ── Schedule tab ─────────────────────────────────────────────────────────
    const [sessions, setSessions] = useState([]);
    const [courses, setCourses]   = useState([]);
    const [schedForm, setSchedForm] = useState({ course_id: "", day_of_week: "1", start_time: "09:00", end_time: "10:00", location: "" });
    const [schedMsg, setSchedMsg] = useState(null);

    useEffect(() => {
        if (activeTab !== "Schedule") return;
        Promise.all([
            apiClient.get("/api/schedule"),
            apiClient.get("/api/courses"),
        ]).then(async ([sRes, cRes]) => {
            if (sRes?.ok) { const d = await sRes.json(); setSessions(d.sessions || []); }
            if (cRes?.ok) { const d = await cRes.json(); setCourses(d.courses || []); }
        });
    }, [activeTab]);

    const addSession = async () => {
        if (!schedForm.course_id) return setSchedMsg({ type: "error", text: "Select a course." });
        const res = await apiClient.post("/api/schedule", {
            ...schedForm, course_id: Number(schedForm.course_id), day_of_week: Number(schedForm.day_of_week),
        });
        if (res?.ok) {
            const sRes = await apiClient.get("/api/schedule");
            if (sRes?.ok) { const d = await sRes.json(); setSessions(d.sessions || []); }
            setSchedMsg({ type: "success", text: "Class added." });
        } else setSchedMsg({ type: "error", text: "Failed to add class." });
    };

    const deleteSession = async (id) => {
        await apiClient.delete(`/api/schedule/${id}`);
        setSessions((prev) => prev.filter((s) => s.session_id !== id));
    };

    useEffect(() => {
        if (activeTab !== "AI" || aiSettings) return;
        apiClient.get("/api/users/ai-settings").then(async (res) => {
            if (res?.ok) {
                const data = await res.json();
                setAISettings(data);
                setSelectedModel(data.ai_model);
            }
        });
    }, [activeTab, aiSettings]);

    const saveNotifPrefs = async () => {
        setSaving(true);
        try {
            const res = await apiClient.put("/api/notifications/preferences", notifPrefs);
            if (res?.ok) setMessage({ type: "success", text: "Preferences saved." });
            else setMessage({ type: "error", text: "Save failed." });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const deleteAccount = async (accountId) => {
        await apiClient.delete(`/api/linked-accounts/${accountId}`);
        setAccounts(accounts.filter((a) => a.account_id !== accountId));
    };

    const saveAISettings = async () => {
        setAISaving(true);
        setAIMessage(null);
        try {
            const body = { ai_model: selectedModel };
            if (byokKey) body.gemini_api_key = byokKey;
            const res = await apiClient.patch("/api/users/ai-settings", body);
            if (res?.ok) {
                setAIMessage({ type: "success", text: "AI settings saved." });
                setByokKey("");
                const refreshed = await apiClient.get("/api/users/ai-settings");
                if (refreshed?.ok) setAISettings(await refreshed.json());
            } else {
                const err = await res.json().catch(() => ({}));
                setAIMessage({ type: "error", text: err.error || "Save failed." });
            }
        } finally {
            setAISaving(false);
            setTimeout(() => setAIMessage(null), 4000);
        }
    };

    const clearBYOKKey = async () => {
        setAISaving(true);
        try {
            const res = await apiClient.patch("/api/users/ai-settings", { clear_key: true });
            if (res?.ok) {
                setAIMessage({ type: "success", text: "API key removed." });
                setAISettings((prev) => ({ ...prev, has_byok_key: false }));
            }
        } finally {
            setAISaving(false);
            setTimeout(() => setAIMessage(null), 3000);
        }
    };

    const msgCls = (type) => type === "success" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger";

    return (
        <DashboardLayout>
            <div className="max-w-3xl">
                <h1 className="text-2xl font-bold text-ink mb-6">Settings</h1>

                {globalMessage && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${msgCls(globalMessage.type)}`}>
                        {globalMessage.text}
                    </div>
                )}

                {/* Profile card */}
                <div className="card p-4 mb-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand text-brand-fg flex items-center justify-center font-bold">
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-ink">{user?.username}</p>
                        <p className="text-sm text-ink-soft">{user?.email}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-line mb-6 overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
                                activeTab === tab
                                    ? "border-b-2 border-brand text-brand"
                                    : "text-ink-soft hover:text-ink"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Linked Accounts tab */}
                {activeTab === "Linked Accounts" && (
                    <div className="space-y-3">
                        {accounts.length === 0 ? (
                            <p className="text-ink-faint">No accounts linked. Go to the dashboard to add one.</p>
                        ) : accounts.map((a) => (
                            <div key={a.account_id} className="card p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-ink">{a.title || a.lms_name}</p>
                                    <p className="text-xs text-ink-faint">{a.api_base_url}</p>
                                    {a.last_synced && (
                                        <p className="text-xs text-ink-faint mt-0.5">
                                            Last synced: {new Date(a.last_synced).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteAccount(a.account_id)}
                                    className="text-xs text-danger hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Notifications tab */}
                {activeTab === "Notifications" && notifPrefs && (
                    <div className="card p-6 space-y-4">
                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${msgCls(message.type)}`}>
                                {message.text}
                            </div>
                        )}
                        <label className="flex items-center justify-between">
                            <span className="text-sm font-medium text-ink-soft">Email notifications</span>
                            <input type="checkbox" checked={notifPrefs.email_enabled} onChange={(e) => setNotifPrefs({ ...notifPrefs, email_enabled: e.target.checked })} className="h-4 w-4 accent-brand" />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-sm font-medium text-ink-soft">In-app notifications</span>
                            <input type="checkbox" checked={notifPrefs.web_enabled} onChange={(e) => setNotifPrefs({ ...notifPrefs, web_enabled: e.target.checked })} className="h-4 w-4 accent-brand" />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-sm font-medium text-ink-soft">Daily digest</span>
                            <input type="checkbox" checked={notifPrefs.daily_digest} onChange={(e) => setNotifPrefs({ ...notifPrefs, daily_digest: e.target.checked })} className="h-4 w-4 accent-brand" />
                        </label>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-ink-soft">Alert hours before deadline</span>
                            <input type="number" min={1} max={168} value={notifPrefs.deadline_hours} onChange={(e) => setNotifPrefs({ ...notifPrefs, deadline_hours: Number(e.target.value) })} className="w-20 bg-surface text-ink border border-line rounded px-2 py-1 text-sm text-right" />
                        </div>
                        <button onClick={saveNotifPrefs} disabled={saving} className="w-full bg-brand text-brand-fg py-2 rounded-lg text-sm font-medium hover:bg-brand-hover transition disabled:opacity-50">
                            {saving ? "Saving..." : "Save Preferences"}
                        </button>
                    </div>
                )}

                {/* AI tab */}
                {activeTab === "AI" && (
                    <div className="space-y-6">
                        {/* Tier badge */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-ink">AI Plan</h3>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    aiSettings?.subscription_tier === "pro"
                                        ? "bg-brand-subtle text-brand"
                                        : "bg-subtle text-ink-soft"
                                }`}>
                                    {aiSettings?.subscription_tier === "pro" ? "Pro" : "Free"}
                                </span>
                            </div>
                            <p className="text-sm text-ink-soft">
                                {aiSettings?.subscription_tier === "pro"
                                    ? "You have access to Gemini 2.5 Flash on the platform account."
                                    : "Using Gemini 2.5 Flash-Lite on our shared free quota."}
                            </p>

                            {aiSettings?.subscription_tier !== "pro" && (
                                <div className="mt-4 p-4 bg-brand-subtle rounded-lg border border-line">
                                    <p className="text-sm font-semibold text-brand mb-1">Upgrade to Pro</p>
                                    <p className="text-xs text-ink-soft mb-3">
                                        Get Gemini 2.5 Flash for faster, higher-quality AI summaries and study plans.
                                        No rate limits.
                                    </p>
                                    <button
                                        disabled
                                        className="text-xs bg-brand text-brand-fg px-4 py-1.5 rounded-lg opacity-50 cursor-not-allowed"
                                    >
                                        Coming soon
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* BYOK section */}
                        <div className="card p-6 space-y-4">
                            <div>
                                <h3 className="font-semibold text-ink mb-1">Use Your Own Google AI Key</h3>
                                <p className="text-sm text-ink-soft">
                                    Add your own{" "}
                                    <span className="font-mono text-xs bg-subtle px-1 rounded">AIza...</span> key
                                    from{" "}
                                    <span className="text-brand underline cursor-not-allowed" title="aistudio.google.com/apikey">
                                        Google AI Studio
                                    </span>
                                    {" "}to bypass platform limits and pick your own model.
                                    Your key is encrypted at rest.
                                </p>
                            </div>

                            {aiMessage && (
                                <div className={`p-3 rounded-lg text-sm ${msgCls(aiMessage.type)}`}>
                                    {aiMessage.text}
                                </div>
                            )}

                            {aiSettings?.has_byok_key && (
                                <div className="flex items-center justify-between p-3 bg-success-subtle rounded-lg">
                                    <span className="text-sm text-success font-medium">API key saved</span>
                                    <button
                                        onClick={clearBYOKKey}
                                        disabled={aiSaving}
                                        className="text-xs text-danger hover:underline disabled:opacity-50"
                                    >
                                        Remove key
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-ink-soft mb-1">
                                    {aiSettings?.has_byok_key ? "Replace API key" : "Google AI API key"}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type={showKey ? "text" : "password"}
                                        placeholder="AIza..."
                                        value={byokKey}
                                        onChange={(e) => setByokKey(e.target.value)}
                                        className={`${INPUT} flex-1 font-mono`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey((v) => !v)}
                                        className="text-xs text-ink-soft border border-line rounded-lg px-3 hover:bg-subtle"
                                    >
                                        {showKey ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-ink-soft mb-1">Preferred model</label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className={INPUT}
                                >
                                    {(aiSettings?.allowed_models || []).map((m) => (
                                        <option key={m} value={m}>
                                            {MODEL_LABELS[m] || m}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-ink-faint mt-1">
                                    Model selection only takes effect when using your own API key.
                                </p>
                            </div>

                            <button
                                onClick={saveAISettings}
                                disabled={aiSaving || (!byokKey && selectedModel === aiSettings?.ai_model)}
                                className="w-full bg-brand text-brand-fg py-2 rounded-lg text-sm font-medium hover:bg-brand-hover transition disabled:opacity-50"
                            >
                                {aiSaving ? "Saving..." : "Save AI Settings"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Schedule tab */}
                {activeTab === "Schedule" && (
                    <div className="card p-6 space-y-6">
                        <div>
                            <h3 className="font-semibold text-ink mb-4">Add recurring class</h3>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="col-span-2">
                                    <label className="text-xs text-ink-soft mb-1 block">Course</label>
                                    <select value={schedForm.course_id}
                                            onChange={(e) => setSchedForm((f) => ({ ...f, course_id: e.target.value }))}
                                            className={INPUT}>
                                        <option value="">Select a course…</option>
                                        {courses.map((c) => (
                                            <option key={c.course_id} value={c.course_id}>
                                                {c.course_name}{c.course_code ? ` (${c.course_code})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-ink-soft mb-1 block">Day</label>
                                    <select value={schedForm.day_of_week}
                                            onChange={(e) => setSchedForm((f) => ({ ...f, day_of_week: e.target.value }))}
                                            className={INPUT}>
                                        {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-ink-soft mb-1 block">Location</label>
                                    <input type="text" placeholder="e.g. Room 204"
                                           value={schedForm.location}
                                           onChange={(e) => setSchedForm((f) => ({ ...f, location: e.target.value }))}
                                           className={INPUT} />
                                </div>
                                <div>
                                    <label className="text-xs text-ink-soft mb-1 block">Start time</label>
                                    <input type="time" value={schedForm.start_time}
                                           onChange={(e) => setSchedForm((f) => ({ ...f, start_time: e.target.value }))}
                                           className={INPUT} />
                                </div>
                                <div>
                                    <label className="text-xs text-ink-soft mb-1 block">End time</label>
                                    <input type="time" value={schedForm.end_time}
                                           onChange={(e) => setSchedForm((f) => ({ ...f, end_time: e.target.value }))}
                                           className={INPUT} />
                                </div>
                            </div>
                            {schedMsg && (
                                <p className={`text-xs mb-2 ${schedMsg.type === "error" ? "text-danger" : "text-success"}`}>{schedMsg.text}</p>
                            )}
                            <button onClick={addSession}
                                    className="bg-brand text-brand-fg px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-hover transition">
                                Add class
                            </button>
                        </div>

                        <div>
                            <h3 className="font-semibold text-ink mb-3">Weekly schedule</h3>
                            {sessions.length === 0 ? (
                                <p className="text-sm text-ink-faint">No classes added yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {sessions.map((s) => (
                                        <div key={s.session_id}
                                             className="flex items-center gap-3 p-3 rounded-lg border border-line hover:bg-subtle transition-colors">
                                            <div className="w-1 h-10 rounded-full flex-shrink-0"
                                                 style={{ backgroundColor: s.color || "#6B7280" }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-ink">{s.course_name}</p>
                                                <p className="text-xs text-ink-faint">
                                                    {DAY_NAMES[s.day_of_week]} · {s.start_time.slice(0,5)}–{s.end_time.slice(0,5)}
                                                    {s.location ? ` · ${s.location}` : ""}
                                                </p>
                                            </div>
                                            <button onClick={() => deleteSession(s.session_id)}
                                                    className="text-ink-faint hover:text-danger transition text-sm">✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Connected Services tab */}
                {activeTab === "Connected Services" && (
                    <div className="card p-6">
                        <h3 className="font-semibold text-ink mb-4">Google Calendar</h3>
                        <p className="text-sm text-ink-soft mb-4">
                            Connect your Google Calendar to automatically sync assignment due dates.
                            Classerize will create and update events so your calendar stays current.
                        </p>
                        {accounts.some((a) => a.lms_name === "GoogleCalendar") ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-success font-medium bg-success-subtle rounded-lg px-3 py-1.5">
                                    Connected
                                </span>
                                <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/google/calendar`}
                                    className="text-xs text-brand hover:underline"
                                >
                                    Reconnect
                                </a>
                            </div>
                        ) : (
                            <a
                                href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/google/calendar`}
                                className="inline-flex items-center gap-2 bg-surface border border-line rounded-lg px-4 py-2 text-sm text-ink-soft hover:bg-subtle transition"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Connect Google Calendar
                            </a>
                        )}
                        <p className="text-xs text-ink-faint mt-3">
                            Syncs every 30 minutes. Requires Google OAuth and <code className="bg-subtle px-1 rounded">GOOGLE_CLIENT_ID</code> to be configured.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default withAuth(SettingsPage);
