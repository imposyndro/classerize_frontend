"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar"; // Navbar included for logged-in pages
import CoursesList from "@/components/CoursesList";
import AssignmentsList from "@/components/AssignmentsList";

export default function DashboardPage() {
    const [linkedAccounts, setLinkedAccounts] = useState([]);
    const [canvasToken, setCanvasToken] = useState("");
    const [linkingError, setLinkingError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch linked LMS accounts
    useEffect(() => {
        const fetchLinkedAccounts = async () => {
            try {
                const response = await fetch("/api/linked-accounts", {
                    method: "GET",
                    credentials: "include",
                });
                if (!response.ok) {
                    throw new Error("No linked accounts found.");
                }
                const accounts = await response.json();
                setLinkedAccounts(accounts);
            } catch (error) {
                console.error("Error fetching linked accounts:", error.message);
                setLinkedAccounts([]); // Gracefully handle no linked accounts
            }
        };
        fetchLinkedAccounts();
    }, []);

    // Handle linking Canvas account
    const handleLinkCanvasAccount = async (e) => {
        e.preventDefault();
        setLinkingError("");
        setSuccessMessage("");

        if (!canvasToken.trim()) {
            setLinkingError("Canvas token is required.");
            return;
        }

        try {
            const response = await fetch("/api/linked-accounts/canvas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ token: canvasToken }),
            });

            if (!response.ok) {
                const { error } = await response.json();
                throw new Error(error || "Failed to link Canvas account.");
            }

            const { message } = await response.json();
            setSuccessMessage(message);
            setCanvasToken(""); // Clear input field
            // Re-fetch linked accounts after successful linking
            fetchLinkedAccounts();
        } catch (error) {
            setLinkingError(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <Navbar />

            <div className="container mx-auto py-10">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                    Welcome to Your Dashboard
                </h1>

                {/* Linked Accounts Section */}
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        Linked Accounts
                    </h2>
                    {linkedAccounts.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-2">
                            {linkedAccounts.map((account) => (
                                <li key={account.account_id} className="text-gray-600">
                                    {account.lms_name} - {account.lms_user_id}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No linked accounts yet.</p>
                    )}
                </div>

                {/* Link Canvas Account Section */}
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        Link Canvas Account
                    </h2>
                    <form onSubmit={handleLinkCanvasAccount} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter Canvas Token"
                            value={canvasToken}
                            onChange={(e) => setCanvasToken(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring focus:ring-blue-300"
                        >
                            Link Canvas Account
                        </button>
                    </form>
                    {linkingError && (
                        <p className="text-red-500 mt-2">{linkingError}</p>
                    )}
                    {successMessage && (
                        <p className="text-green-500 mt-2">{successMessage}</p>
                    )}
                </div>

                {/* Existing Features */}
                {/* <CoursesList />
                <AssignmentsList />*/}
            </div>
        </div>
    );
}
