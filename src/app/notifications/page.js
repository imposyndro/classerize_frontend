"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/dashboard/Navbar";
import { withAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await apiClient.get("/api/notifications");
                if (res?.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);
                }
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const markRead = async (id) => {
        await apiClient.patch(`/api/notifications/${id}/read`);
        setNotifications(notifications.map((n) => n.notification_id === id ? { ...n, read_at: new Date() } : n));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h1>
                {loading ? (
                    <p className="text-gray-400">Loading...</p>
                ) : notifications.length === 0 ? (
                    <p className="text-gray-500 text-center py-16">No notifications yet.</p>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((n) => (
                            <div
                                key={n.notification_id}
                                className={`bg-white rounded-lg shadow p-4 flex justify-between items-start gap-4 ${!n.read_at ? "border-l-4 border-blue-500" : ""}`}
                            >
                                <div>
                                    <p className={`text-sm ${!n.read_at ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                                        {n.message || n.notification_type}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(n.notification_time).toLocaleString()}
                                    </p>
                                </div>
                                {!n.read_at && (
                                    <button onClick={() => markRead(n.notification_id)} className="text-xs text-blue-500 hover:underline shrink-0">
                                        Mark read
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default withAuth(NotificationsPage);
