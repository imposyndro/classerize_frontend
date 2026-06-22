"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import AssignmentCard from "@/components/assignments/AssignmentCard";
import AddAssignmentModal from "@/components/assignments/AddAssignmentModal";
import { withAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

const todayISO  = () => new Date().toISOString().slice(0, 10);
const weekEndISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
};

function AssignmentsPage() {
    const [assignments, setAssignments] = useState([]);
    const [total, setTotal]             = useState(0);
    const [loading, setLoading]         = useState(true);
    const [showModal, setShowModal]     = useState(false);
    const [quickFilter, setQuickFilter] = useState("all"); // all | today | week | overdue
    const [filters, setFilters]         = useState({ status: "", dueBefore: "", dueAfter: "" });

    const activeFilters = () => {
        const f = { ...filters };
        if (quickFilter === "today")  { f.dueAfter = todayISO(); f.dueBefore = todayISO(); }
        if (quickFilter === "week")   { f.dueAfter = todayISO(); f.dueBefore = weekEndISO(); }
        if (quickFilter === "overdue") { f.status = "pending"; f.dueBefore = todayISO(); }
        return f;
    };

    const fetchAssignments = useCallback(async () => {
        setLoading(true);
        const f = activeFilters();
        const params = new URLSearchParams({ limit: 100 });
        if (f.status)    params.set("status",    f.status);
        if (f.dueBefore) params.set("dueBefore", f.dueBefore);
        if (f.dueAfter)  params.set("dueAfter",  f.dueAfter);

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
    }, [filters, quickFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

    const markStatus = async (id, status) => {
        await apiClient.patch(`/api/assignments/${id}/status`, { status });
        fetchAssignments();
    };

    const QUICK_FILTERS = [
        { key: "all",     label: "All" },
        { key: "today",   label: "Due today" },
        { key: "week",    label: "This week" },
        { key: "overdue", label: "Overdue" },
    ];

    const inputCls = "bg-surface text-ink border border-line rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand";

    return (
        <DashboardLayout>
            <div>
                {/* Title row */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-2xl font-bold text-ink">Assignments</h1>
                        <p className="text-sm text-ink-faint tabular-nums">{total} total</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 bg-brand text-brand-fg text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-hover transition"
                    >
                        <span className="text-lg leading-none">+</span> Add Assignment
                    </button>
                </div>

                {/* Quick filters */}
                <div className="flex gap-2 mb-4">
                    {QUICK_FILTERS.map((qf) => (
                        <button
                            key={qf.key}
                            onClick={() => { setQuickFilter(qf.key); setFilters({ status: "", dueBefore: "", dueAfter: "" }); }}
                            className={`text-sm px-3 py-1.5 rounded-full border transition ${
                                quickFilter === qf.key
                                    ? "bg-brand text-brand-fg border-brand"
                                    : "bg-surface text-ink-soft border-line hover:border-brand"
                            }`}
                        >
                            {qf.label}
                        </button>
                    ))}
                </div>

                {/* Advanced filter bar */}
                <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
                    <select
                        value={filters.status}
                        onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setQuickFilter("all"); }}
                        className={inputCls}
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                        <option value="completed">Completed</option>
                        <option value="excused">Excused</option>
                    </select>

                    <div className="flex items-center gap-2 text-sm text-ink-soft">
                        <label>After:</label>
                        <input type="date" value={filters.dueAfter}
                            onChange={(e) => { setFilters({ ...filters, dueAfter: e.target.value }); setQuickFilter("all"); }}
                            className={inputCls} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-soft">
                        <label>Before:</label>
                        <input type="date" value={filters.dueBefore}
                            onChange={(e) => { setFilters({ ...filters, dueBefore: e.target.value }); setQuickFilter("all"); }}
                            className={inputCls} />
                    </div>
                    <button
                        onClick={() => { setFilters({ status: "", dueBefore: "", dueAfter: "" }); setQuickFilter("all"); }}
                        className="text-sm text-ink-faint hover:text-ink-soft"
                    >
                        Clear
                    </button>
                </div>

                {/* List */}
                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="card p-4 border-l-4 border-line">
                                <div className="skeleton h-4 w-3/4 mb-2" />
                                <div className="skeleton h-3 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="text-center py-16 text-ink-faint">
                        {quickFilter !== "all"
                            ? `No assignments match this filter.`
                            : "No assignments found. Sync your LMS accounts or add one manually."}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {assignments.map((a) => (
                            <AssignmentCard
                                key={a.assignment_id}
                                assignment={a}
                                onMarkStatus={markStatus}
                                onProgressChange={fetchAssignments}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <AddAssignmentModal
                    onClose={() => setShowModal(false)}
                    onCreated={fetchAssignments}
                />
            )}
        </DashboardLayout>
    );
}

export default withAuth(AssignmentsPage);
