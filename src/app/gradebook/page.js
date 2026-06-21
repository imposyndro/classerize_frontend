"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/dashboard/Navbar";
import { withAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

function GradebookPage() {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await apiClient.get("/api/grades/summary");
                if (res?.ok) {
                    const data = await res.json();
                    setSummary(data.summary || []);
                }
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const getGradeColor = (pct) => {
        if (!pct) return "text-gray-400";
        if (pct >= 90) return "text-green-600";
        if (pct >= 80) return "text-blue-600";
        if (pct >= 70) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Gradebook</h1>

                {loading ? (
                    <div className="space-y-3">
                        {[1,2,3].map(i => (
                            <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/4" />
                            </div>
                        ))}
                    </div>
                ) : summary.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        No grade data yet. Sync your accounts from the dashboard to pull grades.
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Course</th>
                                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Institution</th>
                                    <th className="text-left px-4 py-3 text-gray-600 font-medium">LMS</th>
                                    <th className="text-right px-4 py-3 text-gray-600 font-medium">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {summary.map((row) => (
                                    <tr key={row.course_id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800">{row.course_name}</p>
                                            {row.course_code && <p className="text-xs text-gray-400">{row.course_code}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{row.institution_name || "—"}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{row.lms_name}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`font-bold text-lg ${getGradeColor(row.grade_percent)}`}>
                                                {row.letter_grade || "—"}
                                            </span>
                                            {row.grade_percent && (
                                                <span className="ml-2 text-xs text-gray-400">
                                                    {Number(row.grade_percent).toFixed(1)}%
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}

export default withAuth(GradebookPage);
