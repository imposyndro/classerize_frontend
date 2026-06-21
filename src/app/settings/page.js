"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/dashboard/Navbar";
import { withAuth, useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

const TABS = ["Linked Accounts", "Notifications", "Connected Services"];

function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("Linked Accounts");
    const [accounts, setAccounts] = useState([]);
    const [notifPrefs, setNotifPrefs] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

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

                {/* Connected Services tab */}
                {activeTab === "Connected Services" && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Google Calendar</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Connect your Google Calendar to sync assignment deadlines and class events automatically.
                        </p>
                        <a
                            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/google?scope=calendar`}
                            className="inline-block bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                            Connect Google Calendar
                        </a>
                        <p className="text-xs text-gray-400 mt-3">Phase 4 feature — requires Google OAuth connection.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default withAuth(SettingsPage);
