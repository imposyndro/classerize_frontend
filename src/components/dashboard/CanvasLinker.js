"use client";

import { useState } from "react";
import apiClient from "@/lib/apiClient";

export default function CanvasLinker({ onLinkSuccess }) {
    const [token, setToken] = useState("");
    const [apiBaseUrl, setApiBaseUrl] = useState("https://canvas.instructure.com");
    const [status, setStatus] = useState(null); // { type: 'success'|'error', message }
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);
        setLoading(true);
        try {
            const res = await apiClient.post("/api/linked-accounts/auth/canvas", {
                token,
                apiBaseUrl,
            });
            const data = await res.json();
            if (res?.ok) {
                setStatus({ type: "success", message: `Canvas account linked! (${data.canvasUser?.name || ""})` });
                setToken("");
                onLinkSuccess?.();
            } else {
                setStatus({ type: "error", message: data.error || "Failed to link Canvas account." });
            }
        } catch {
            setStatus({ type: "error", message: "Network error. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Link a Canvas Account</h2>

            {status && (
                <div
                    className={`mb-4 p-3 rounded-lg text-sm ${
                        status.type === "success"
                            ? "bg-success-subtle text-success"
                            : "bg-danger-subtle text-danger"
                    }`}
                >
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-ink-soft mb-1">
                        Canvas Instance URL
                    </label>
                    <input
                        type="url"
                        value={apiBaseUrl}
                        onChange={(e) => setApiBaseUrl(e.target.value)}
                        className="w-full bg-surface text-ink border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                        placeholder="https://canvas.instructure.com"
                    />
                    <p className="text-xs text-ink-faint mt-1">
                        Use your institution's Canvas URL, e.g. https://csumb.instructure.com
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-ink-soft mb-1">
                        Canvas API Token
                    </label>
                    <input
                        type="password"
                        required
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full bg-surface text-ink border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                        placeholder="Paste your Canvas access token"
                    />
                    <p className="text-xs text-ink-faint mt-1">
                        Generate in Canvas: Account → Settings → New Access Token
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-brand text-brand-fg px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-hover transition disabled:opacity-50"
                >
                    {loading ? "Linking..." : "Link Canvas Account"}
                </button>
            </form>
        </div>
    );
}
