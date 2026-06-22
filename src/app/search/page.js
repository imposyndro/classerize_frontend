"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layouts/DashboardLayout";
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

    if (!q) return <p className="text-ink-faint py-8 text-center">Enter a search term above.</p>;

    if (loading) return (
        <div className="space-y-3 mt-4">
            {[1,2,3].map(i => (
                <div key={i} className="skeleton rounded-card h-12" />
            ))}
        </div>
    );

    if (!results) return null;

    const total = (results.assignments?.length || 0) + (results.courses?.length || 0);

    return (
        <div>
            <p className="text-sm text-ink-faint mb-4">{total} result{total !== 1 ? "s" : ""} for <strong className="text-ink-soft">"{q}"</strong></p>

            {results.courses?.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-2">Courses</h2>
                    <div className="card divide-y divide-line overflow-hidden">
                        {results.courses.map((c) => (
                            <Link key={c.course_id} href="/gradebook"
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-subtle transition-colors">
                                <div className="w-3 h-3 rounded-full"
                                     style={{ backgroundColor: c.color || "#6B7280" }} />
                                <div>
                                    <p className="font-medium text-ink">{c.course_name}</p>
                                    <p className="text-xs text-ink-faint">{c.course_code} · {c.lms_name}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {results.assignments?.length > 0 && (
                <section>
                    <h2 className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-2">Assignments</h2>
                    <div className="card divide-y divide-line overflow-hidden">
                        {results.assignments.map((a) => (
                            <Link key={a.assignment_id} href="/assignments"
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-subtle transition-colors">
                                <div className="w-3 h-3 rounded-full"
                                     style={{ backgroundColor: a.color || "#6B7280" }} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-ink truncate">{a.assignment_name}</p>
                                    <p className="text-xs text-ink-faint">{a.course_name}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    {a.due_date && (
                                        <p className="text-xs text-ink-faint">
                                            {new Date(a.due_date).toLocaleDateString()}
                                        </p>
                                    )}
                                    {a.points_possible && (
                                        <p className="text-xs text-ink-faint">{a.points_possible} pts</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {total === 0 && (
                <p className="text-center text-ink-faint py-16">Nothing found for "{q}".</p>
            )}
        </div>
    );
}

function SearchPage() {
    return (
        <DashboardLayout>
            <div className="max-w-2xl">
                <h1 className="text-2xl font-bold text-ink mb-6">Search</h1>
                <Suspense fallback={<div className="text-ink-faint">Loading…</div>}>
                    <SearchResults />
                </Suspense>
            </div>
        </DashboardLayout>
    );
}

export default withAuth(SearchPage);
