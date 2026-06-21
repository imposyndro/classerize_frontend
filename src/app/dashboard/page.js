"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/dashboard/Navbar";
import AccountCard from "@/components/dashboard/AccountCard";
import CanvasLinker from "@/components/dashboard/CanvasLinker";
import CalendarView from "@/components/dashboard/CalendarView";
import { withAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

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
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Navbar />
            <main className="container mx-auto py-10 px-4 flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Dashboard</h1>

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
            </main>
            <div className="container mx-auto px-4 pb-6">
                <CanvasLinker onLinkSuccess={fetchLinkedAccounts} />
            </div>
            <div className="container mx-auto px-4 pb-10">
                <CalendarView />
            </div>
        </div>
    );
}

export default withAuth(DashboardPage);
