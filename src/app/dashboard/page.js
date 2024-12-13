"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/dashboard/Navbar";
import AccountCard from "@/components/dashboard/AccountCard";
import CanvasLinker from "@/components/dashboard/CanvasLinker";

export default function DashboardPage() {
    const [linkedAccounts, setLinkedAccounts] = useState([]);

    const fetchLinkedAccounts = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/linked-accounts", {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error("Failed to fetch linked accounts.");
            const accounts = await response.json();

            const accountsWithCourses = await Promise.all(
                accounts.map(async (account) => {
                    try {
                        const courseResponse = await fetch(
                            `http://localhost:5000/api/linked-accounts/accounts/${account.account_id}/courses`,
                            { method: "GET", credentials: "include" }
                        );
                        if (!courseResponse.ok) throw new Error("Failed to fetch courses.");
                        const { courses } = await courseResponse.json();
                        return { ...account, courses };
                    } catch (error) {
                        console.error(
                            `Error fetching courses for account ${account.account_id}:`,
                            error.message
                        );
                        return { ...account, courses: [] };
                    }
                })
            );

            setLinkedAccounts(accountsWithCourses);
        } catch (error) {
            console.error("Error fetching linked accounts:", error.message);
            setLinkedAccounts([]);
        }
    };

    const updateAccountTitle = async (accountId, newTitle) => {
        try {
            const response = await fetch(`http://localhost:5000/api/linked-accounts/${accountId}/update-title`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ title: newTitle }),
            });

            if (!response.ok) throw new Error("Failed to update account title.");

            // Optionally, refresh the linked accounts after updating
            fetchLinkedAccounts();
        } catch (error) {
            console.error("Error updating account title:", error.message);
        }
    };

    useEffect(() => {
        fetchLinkedAccounts();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Navbar />
            <div className="container mx-auto py-10 flex-1">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                    Welcome to Your Dashboard
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {linkedAccounts.length > 0 ? (
                        linkedAccounts.map((account) => (
                            <AccountCard
                                key={account.account_id}
                                account={account}
                                onUpdateTitle={updateAccountTitle} // Pass the function here
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-full text-center">
                            No linked accounts yet.
                        </p>
                    )}
                </div>
            </div>
            <div className="container mx-auto py-4">
                <CanvasLinker onLinkSuccess={fetchLinkedAccounts} />
            </div>
        </div>
    );
}
