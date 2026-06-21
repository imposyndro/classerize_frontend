"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/dashboard/Navbar";
import { withAuth, useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

const TABS = ["Linked Accounts", "Notifications", "AI", "Connected Services"];

const useSearchParams = () => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
};

const MODEL_LABELS = {
    "gemini-2.5-flash-lite-preview-06-17": "Gemini 2.5 Flash-Lite (cheapest)",
    "gemini-2.5-flash": "Gemini 2.5 Flash (balanced)",
    "gemini-2.5-pro": "Gemini 2.5 Pro (most capable)",
};

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
                // Refresh to reflect new key presence
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

                {globalMessage && (
                    <div className={`mb-4 p-3 rounded text-sm ${globalMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {globalMessage.text}
                    </div>
                )}

                {/* Profile card */}
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{user?.username}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium transition ${
                                activeTab === tab
                                    ? "border-b-2 border-blue-600 text-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
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
                            <p className="text-gray-500">No accounts linked. Go to the dashboard to add one.</p>
                        ) : accounts.map((a) => (
                            <div key={a.account_id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800">{a.title || a.lms_name}</p>
                                    <p className="text-xs text-gray-400">{a.api_base_url}</p>
                                    {a.last_synced && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Last synced: {new Date(a.last_synced).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteAccount(a.account_id)}
                                    className="text-xs text-red-500 hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Notifications tab */}
                {activeTab === "Notifications" && notifPrefs && (
                    <div className="bg-white rounded-lg shadow p-6 space-y-4">
                        {message && (
                            <div className={`p-3 rounded text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                {message.text}
                            </div>
                        )}
                        <label className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Email notifications</span>
                            <input type="checkbox" checked={notifPrefs.email_enabled} onChange={(e) => setNotifPrefs({ ...notifPrefs, email_enabled: e.target.checked })} className="h-4 w-4" />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">In-app notifications</span>
                            <input type="checkbox" checked={notifPrefs.web_enabled} onChange={(e) => setNotifPrefs({ ...notifPrefs, web_enabled: e.target.checked })} className="h-4 w-4" />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Daily digest</span>
                            <input type="checkbox" checked={notifPrefs.daily_digest} onChange={(e) => setNotifPrefs({ ...notifPrefs, daily_digest: e.target.checked })} className="h-4 w-4" />
                        </label>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Alert hours before deadline</span>
                            <input type="number" min={1} max={168} value={notifPrefs.deadline_hours} onChange={(e) => setNotifPrefs({ ...notifPrefs, deadline_hours: Number(e.target.value) })} className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right" />
                        </div>
                        <button onClick={saveNotifPrefs} disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
                            {saving ? "Saving..." : "Save Preferences"}
                        </button>
                    </div>
                )}

                {/* AI tab */}
                {activeTab === "AI" && (
                    <div className="space-y-6">
                        {/* Tier badge */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-800">AI Plan</h3>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    aiSettings?.subscription_tier === "pro"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-gray-100 text-gray-600"
                                }`}>
                                    {aiSettings?.subscription_tier === "pro" ? "Pro" : "Free"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">
                                {aiSettings?.subscription_tier === "pro"
                                    ? "You have access to Gemini 2.5 Flash on the platform account."
                                    : "Using Gemini 2.5 Flash-Lite on our shared free quota."}
                            </p>

                            {aiSettings?.subscription_tier !== "pro" && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                                    <p className="text-sm font-semibold text-purple-800 mb-1">Upgrade to Pro</p>
                                    <p className="text-xs text-purple-700 mb-3">
                                        Get Gemini 2.5 Flash for faster, higher-quality AI summaries and study plans.
                                        No rate limits.
                                    </p>
                                    <button
                                        disabled
                                        className="text-xs bg-purple-600 text-white px-4 py-1.5 rounded-lg opacity-50 cursor-not-allowed"
                                    >
                                        Coming soon
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* BYOK section */}
                        <div className="bg-white rounded-lg shadow p-6 space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">Use Your Own Google AI Key</h3>
                                <p className="text-sm text-gray-500">
                                    Add your own{" "}
                                    <span className="font-mono text-xs bg-gray-100 px-1 rounded">AIza...</span> key
                                    from{" "}
                                    <span className="text-blue-600 underline cursor-not-allowed" title="aistudio.google.com/apikey">
                                        Google AI Studio
                                    </span>
                                    {" "}to bypass platform limits and pick your own model.
                                    Your key is encrypted at rest.
                                </p>
                            </div>

                            {aiMessage && (
                                <div className={`p-3 rounded text-sm ${aiMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                    {aiMessage.text}
                                </div>
                            )}

                            {aiSettings?.has_byok_key && (
                                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <span className="text-sm text-green-700 font-medium">API key saved</span>
                                    <button
                                        onClick={clearBYOKKey}
                                        disabled={aiSaving}
                                        className="text-xs text-red-500 hover:underline disabled:opacity-50"
                                    >
                                        Remove key
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {aiSettings?.has_byok_key ? "Replace API key" : "Google AI API key"}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type={showKey ? "text" : "password"}
                                        placeholder="AIza..."
                                        value={byokKey}
                                        onChange={(e) => setByokKey(e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey((v) => !v)}
                                        className="text-xs text-gray-500 border border-gray-300 rounded-lg px-3 hover:bg-gray-50"
                                    >
                                        {showKey ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred model</label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {(aiSettings?.allowed_models || []).map((m) => (
                                        <option key={m} value={m}>
                                            {MODEL_LABELS[m] || m}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    Model selection only takes effect when using your own API key.
                                </p>
                            </div>

                            <button
                                onClick={saveAISettings}
                                disabled={aiSaving || (!byokKey && selectedModel === aiSettings?.ai_model)}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {aiSaving ? "Saving..." : "Save AI Settings"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Connected Services tab */}
                {activeTab === "Connected Services" && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Google Calendar</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Connect your Google Calendar to automatically sync assignment due dates.
                            Classerize will create and update events so your calendar stays current.
                        </p>
                        {accounts.some((a) => a.lms_name === "GoogleCalendar") ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-green-700 font-medium bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                                    Connected
                                </span>
                                <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/google/calendar`}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    Reconnect
                                </a>
                            </div>
                        ) : (
                            <a
                                href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/google/calendar`}
                                className="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
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
                        <p className="text-xs text-gray-400 mt-3">
                            Syncs every 30 minutes. Requires Google OAuth and <code className="bg-gray-100 px-1 rounded">GOOGLE_CLIENT_ID</code> to be configured.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default withAuth(SettingsPage);
