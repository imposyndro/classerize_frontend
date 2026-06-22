"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import AccountCard from "@/components/dashboard/AccountCard";
import CanvasLinker from "@/components/dashboard/CanvasLinker";
import CalendarView from "@/components/dashboard/CalendarView";
import { withAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

function StartTodayWidget() {
    const [suggestions, setSuggestions] = useState([]);
    useEffect(() => {
        apiClient.get("/api/assignments/suggestions")
            .then(async (res) => { if (res?.ok) { const d = await res.json(); setSuggestions(d.suggestions?.slice(0, 4) || []); } })
            .catch(() => {});
    }, []);

    if (!suggestions.length) return null;

    return (
        <div className="bg-white rounded-lg shadow p-5 mb-8">
            <h2 className="text-base font-semibold text-gray-700 mb-3">Start today</h2>
            <div className="space-y-2">
                {suggestions.map((s) => (
                    <div key={s.assignment_id}
                         className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                        <div className="w-1 h-10 rounded-full flex-shrink-0"
                             style={{ backgroundColor: s.color || "#6B7280" }} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{s.assignment_name}</p>
                            <p className="text-xs text-gray-400">{s.course_name} · Due in {s.days_left}d</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            s.urgency === "urgent" ? "bg-red-100 text-red-600" :
                            s.urgency === "soon"   ? "bg-yellow-100 text-yellow-700" :
                                                     "bg-green-100 text-green-700"
                        }`}>
                            {s.urgency === "urgent" ? "Start now" :
                             s.urgency === "soon"   ? "Start soon" : "Upcoming"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DashboardPage() {
    const [linkedAccounts, setLinkedAccounts] = useState([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);

    const fetchLinkedAccounts = useCallback(async () => {
        setLoadingAccounts(true);
        try {
            const res = await apiClient.get("/api/linked-accounts");
            if (!res?.ok) throw new Error("Failed to fetch accounts.");
            const accounts = await res.json();

            // Fetch courses for each account in parallel
            const accountsWithCourses = await Promise.all(
                accounts.map(async (account) => {
                    try {
                        const courseRes = await apiClient.get(
                            `/api/linked-accounts/accounts/${account.account_id}/courses`
                        );
                        if (!courseRes?.ok) return { ...account, courses: [] };
                        const { courses } = await courseRes.json();
                        return { ...account, courses };
                    } catch {
                        return { ...account, courses: [] };
                    }
                })
            );

            setLinkedAccounts(accountsWithCourses);
        } catch {
            setLinkedAccounts([]);
        } finally {
            setLoadingAccounts(false);
        }
    }, []);

    const updateAccountTitle = async (accountId, newTitle) => {
        await apiClient.patch(`/api/linked-accounts/${accountId}/update-title`, { title: newTitle });
        fetchLinkedAccounts();
    };

    const deleteAccount = async (accountId) => {
        await apiClient.delete(`/api/linked-accounts/${accountId}`);
        fetchLinkedAccounts();
    };

    useEffect(() => {
        fetchLinkedAccounts();
    }, [fetchLinkedAccounts]);

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Dashboard</h1>

            <StartTodayWidget />

            {loadingAccounts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                            <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                            <div className="h-3 bg-gray-100 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : linkedAccounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {linkedAccounts.map((account) => (
                        <AccountCard
                            key={account.account_id}
                            account={account}
                            onUpdateTitle={updateAccountTitle}
                            onDelete={deleteAccount}
                            onSyncSuccess={fetchLinkedAccounts}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg mb-2">No LMS accounts linked yet.</p>
                    <p className="text-gray-400 text-sm">Connect your Canvas account below to get started.</p>
                </div>
            )}

            <CanvasLinker onLinkSuccess={fetchLinkedAccounts} />
            <div className="mt-6">
                <CalendarView />
            </div>
        </DashboardLayout>
    );
}

export default withAuth(DashboardPage);
