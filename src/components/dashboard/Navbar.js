"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

export default function Navbar() {
    const { user, loading, logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) return;
        apiClient.get("/api/notifications")
            .then(async (res) => {
                if (!res?.ok) return;
                const data = await res.json();
                const unread = (data.notifications || []).filter((n) => !n.read_at).length;
                setUnreadCount(unread);
            })
            .catch(() => {});
    }, [user]);

    return (
        <nav className="flex items-center justify-between bg-blue-600 px-6 py-4 text-white shadow">
            <div className="text-xl font-bold tracking-tight">Classerize</div>
            <div className="flex items-center gap-4">
                {loading ? (
                    <span className="text-blue-200 text-sm">Loading...</span>
                ) : user ? (
                    <>
                        {/* Notification bell */}
                        <Link href="/notifications" className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white hover:text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </Link>

                        <span className="text-sm text-blue-100">
                            Welcome, <strong>{user.username}</strong>
                        </span>
                        <button
                            onClick={logout}
                            className="bg-white text-blue-600 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50 transition"
                        >
                            Logout
                        </button>
                    </>
                ) : null}
            </div>
        </nav>
    );
}
