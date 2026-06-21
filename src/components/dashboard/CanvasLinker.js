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
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Link a Canvas Account</h2>

            {status && (
                <div
                    className={`mb-4 p-3 rounded text-sm ${
                        status.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                >
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Canvas Instance URL
                    </label>
                    <input
                        type="url"
                        value={apiBaseUrl}
                        onChange={(e) => setApiBaseUrl(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://canvas.instructure.com"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Use your institution's Canvas URL, e.g. https://csumb.instructure.com
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Canvas API Token
                    </label>
                    <input
                        type="password"
                        required
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Paste your Canvas access token"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Generate in Canvas: Account → Settings → New Access Token
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? "Linking..." : "Link Canvas Account"}
                </button>
            </form>
        </div>
    );
}
