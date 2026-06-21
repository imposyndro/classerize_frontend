"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/dashboard/Navbar";
import AssignmentCard from "@/components/assignments/AssignmentCard";
import { withAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

function AssignmentsPage() {
    const [assignments, setAssignments] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: "", dueBefore: "", dueAfter: "" });

    const fetchAssignments = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ limit: 100 });
        if (filters.status)    params.set("status", filters.status);
        if (filters.dueBefore) params.set("dueBefore", filters.dueBefore);
        if (filters.dueAfter)  params.set("dueAfter", filters.dueAfter);

        try {
            const res = await apiClient.get(`/api/assignments?${params}`);
            if (res?.ok) {
                const data = await res.json();
                setAssignments(data.assignments || []);
                setTotal(data.total || 0);
            }
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

    const markStatus = async (assignmentId, status) => {
        await apiClient.patch(`/api/assignments/${assignmentId}/status`, { status });
        fetchAssignments();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
                    <span className="text-sm text-gray-400">{total} total</span>
                </div>

                {/* Filter bar */}
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-3">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                        <option value="completed">Completed</option>
                        <option value="excused">Excused</option>
                    </select>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <label>Due after:</label>
                        <input type="date" value={filters.dueAfter}
                            onChange={(e) => setFilters({ ...filters, dueAfter: e.target.value })}
                            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <label>Due before:</label>
                        <input type="date" value={filters.dueBefore}
                            onChange={(e) => setFilters({ ...filters, dueBefore: e.target.value })}
                            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => setFilters({ status: "", dueBefore: "", dueAfter: "" })}
                        className="text-sm text-gray-400 hover:text-gray-600"
                    >
                        Clear
                    </button>
                </div>

                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        No assignments found. Sync your LMS accounts from the dashboard.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {assignments.map((a) => (
                            <AssignmentCard key={a.assignment_id} assignment={a} onMarkStatus={markStatus} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default withAuth(AssignmentsPage);
