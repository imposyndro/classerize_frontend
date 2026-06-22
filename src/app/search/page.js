"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/dashboard/Navbar";
import { withAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

function SearchResults() {
    const searchParams = useSearchParams();
    const q = searchParams.get("q") || "";
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (q.trim().length < 2) { setResults(null); return; }
        setLoading(true);
        apiClient.get(`/api/search?q=${encodeURIComponent(q.trim())}`)
            .then(async (res) => { if (res?.ok) setResults(await res.json()); })
            .finally(() => setLoading(false));
    }, [q]);

    if (!q) return <p className="text-gray-500 py-8 text-center">Enter a search term above.</p>;

    if (loading) return (
        <div className="space-y-3 mt-4">
            {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-lg p-4 animate-pulse h-12" />
            ))}
        </div>
    );

    if (!results) return null;

    const total = (results.assignments?.length || 0) + (results.courses?.length || 0);

    return (
        <div>
            <p className="text-sm text-gray-400 mb-4">{total} result{total !== 1 ? "s" : ""} for <strong>"{q}"</strong></p>

            {results.courses?.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Courses</h2>
                    <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
                        {results.courses.map((c) => (
                            <Link key={c.course_id} href="/gradebook"
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                                <div className="w-3 h-3 rounded-full"
                                     style={{ backgroundColor: c.color || "#6B7280" }} />
                                <div>
                                    <p className="font-medium text-gray-800">{c.course_name}</p>
                                    <p className="text-xs text-gray-400">{c.course_code} · {c.lms_name}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {results.assignments?.length > 0 && (
                <section>
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assignments</h2>
                    <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
                        {results.assignments.map((a) => (
                            <Link key={a.assignment_id} href="/assignments"
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                                <div className="w-3 h-3 rounded-full"
                                     style={{ backgroundColor: a.color || "#6B7280" }} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-800 truncate">{a.assignment_name}</p>
                                    <p className="text-xs text-gray-400">{a.course_name}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    {a.due_date && (
                                        <p className="text-xs text-gray-400">
                                            {new Date(a.due_date).toLocaleDateString()}
                                        </p>
                                    )}
                                    {a.points_possible && (
                                        <p className="text-xs text-gray-300">{a.points_possible} pts</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {total === 0 && (
                <p className="text-center text-gray-400 py-16">Nothing found for "{q}".</p>
            )}
        </div>
    );
}

function SearchPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Search</h1>
                <Suspense fallback={<div className="text-gray-400">Loading…</div>}>
                    <SearchResults />
                </Suspense>
            </main>
        </div>
    );
}

export default withAuth(SearchPage);
