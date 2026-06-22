"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import AccountCard from "@/components/dashboard/AccountCard";
import CanvasLinker from "@/components/dashboard/CanvasLinker";
import CalendarView from "@/components/dashboard/CalendarView";
import { withAuth, useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";
import {
    FiZap, FiUpload, FiPlus, FiCalendar, FiArrowRight,
} from "react-icons/fi";

const letterFor = (pct) => {
    if (pct == null) return "—";
    if (pct >= 93) return "A";
    if (pct >= 90) return "A-";
    if (pct >= 87) return "B+";
    if (pct >= 83) return "B";
    if (pct >= 80) return "B-";
    if (pct >= 77) return "C+";
    if (pct >= 73) return "C";
    if (pct >= 70) return "C-";
    if (pct >= 60) return "D";
    return "F";
};
const toneFor = (pct) =>
    pct == null ? "text-ink-faint" : pct >= 80 ? "text-success" : pct >= 70 ? "text-warning" : "text-danger";
const barFor = (pct) =>
    pct >= 80 ? "bg-success" : pct >= 70 ? "bg-warning" : "bg-danger";

function Tile({ children, className = "", delay = 0 }) {
    return (
        <div
            className={`card-tile p-5 animate-fade-up ${className}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

function GradeHero({ summary, loading }) {
    const graded = summary.filter((r) => r.grade_percent != null);
    const avg = graded.length
        ? graded.reduce((s, r) => s + Number(r.grade_percent), 0) / graded.length
        : null;

    if (loading) {
        return <Tile className="sm:col-span-2"><div className="skeleton h-28 w-full" /></Tile>;
    }

    if (avg == null) {
        return (
            <Tile className="sm:col-span-2" delay={0}>
                <p className="text-sm text-ink-soft">Overall grade</p>
                <p className="mt-3 text-ink-soft text-sm">
                    No grades yet. Link an account and sync to see your standing here.
                </p>
                <Link href="#link-account" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
                    Link an account <FiArrowRight className="h-4 w-4" />
                </Link>
            </Tile>
        );
    }

    return (
        <Tile className="sm:col-span-2" delay={0}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-ink-soft">Overall grade</p>
                    <div className="mt-1 flex items-baseline gap-2">
                        <span className={`text-4xl font-bold tabular-nums tracking-tight ${toneFor(avg)}`}>
                            {avg.toFixed(1)}%
                        </span>
                        <span className={`text-lg font-semibold ${toneFor(avg)}`}>{letterFor(avg)}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-faint">across {graded.length} course{graded.length === 1 ? "" : "s"}</p>
                </div>
                <Link href="/gradebook" className="text-xs font-medium text-brand hover:underline shrink-0">
                    Gradebook →
                </Link>
            </div>
            <div className="mt-4 flex items-end gap-2 h-14">
                {graded.slice(0, 10).map((r) => (
                    <div key={r.course_id} className="flex-1 min-w-0" title={`${r.course_name}: ${Number(r.grade_percent).toFixed(1)}%`}>
                        <div className="w-full rounded-t bg-subtle h-14 flex items-end overflow-hidden">
                            <div className={`w-full rounded-t ${barFor(Number(r.grade_percent))}`}
                                 style={{ height: `${Math.max(8, Number(r.grade_percent))}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </Tile>
    );
}

function StatTile({ label, value, sub, accent = "text-ink", href, hrefLabel, delay }) {
    const inner = (
        <Tile delay={delay} className="h-full">
            <p className="text-sm text-ink-soft">{label}</p>
            <p className={`mt-1 text-3xl font-bold tabular-nums tracking-tight ${accent}`}>{value}</p>
            {sub && <p className="mt-1 text-xs text-ink-faint">{sub}</p>}
            {href && (
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand">
                    {hrefLabel} <FiArrowRight className="h-4 w-4" />
                </span>
            )}
        </Tile>
    );
    return href ? <Link href={href} className="block transition-transform duration-base hover:-translate-y-0.5">{inner}</Link> : inner;
}

function DueSoonTile({ suggestions, loading, delay }) {
    return (
        <Tile className="lg:col-span-2" delay={delay}>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-ink">Due soon</h2>
                <Link href="/assignments" className="text-xs font-medium text-brand hover:underline">All assignments →</Link>
            </div>
            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 w-full" />)}
                </div>
            ) : suggestions.length === 0 ? (
                <p className="text-sm text-ink-faint py-6 text-center">Nothing urgent. You're all caught up. 🎉</p>
            ) : (
                <div className="space-y-2">
                    {suggestions.map((s) => (
                        <Link
                            key={s.assignment_id}
                            href="/assignments"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-subtle transition-colors"
                        >
                            <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: s.color || "#6B7280" }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-ink truncate">{s.assignment_name}</p>
                                <p className="text-xs text-ink-faint">{s.course_name} · Due in {s.days_left}d</p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                s.urgency === "urgent" ? "bg-danger-subtle text-danger" :
                                s.urgency === "soon"   ? "bg-warning-subtle text-warning" :
                                                         "bg-success-subtle text-success"
                            }`}>
                                {s.urgency === "urgent" ? "Start now" : s.urgency === "soon" ? "Start soon" : "Upcoming"}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </Tile>
    );
}

function QuickActionsTile({ delay }) {
    const actions = [
        { href: "/flashcards/review", label: "Review flashcards", icon: FiZap },
        { href: "/import",            label: "Import a syllabus",  icon: FiUpload },
        { href: "/assignments",       label: "Add an assignment",  icon: FiPlus },
        { href: "/study-schedule",    label: "Plan study time",    icon: FiCalendar },
    ];
    return (
        <Tile delay={delay}>
            <h2 className="text-base font-semibold text-ink mb-3">Quick actions</h2>
            <div className="space-y-1">
                {actions.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href}
                          className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-ink-soft hover:bg-subtle hover:text-ink transition-colors">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-subtle text-brand">
                            <Icon className="h-4 w-4" />
                        </span>
                        {label}
                    </Link>
                ))}
            </div>
        </Tile>
    );
}

function DashboardPage() {
    const { user } = useAuth();
    const [linkedAccounts, setLinkedAccounts] = useState([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [summary, setSummary] = useState([]);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [fcStats, setFcStats] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);

    const fetchLinkedAccounts = useCallback(async () => {
        setLoadingAccounts(true);
        try {
            const res = await apiClient.get("/api/linked-accounts");
            if (!res?.ok) throw new Error("Failed to fetch accounts.");
            const accounts = await res.json();

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

    useEffect(() => {
        fetchLinkedAccounts();

        apiClient.get("/api/grades/summary")
            .then(async (res) => { if (res?.ok) { const d = await res.json(); setSummary(d.summary || []); } })
            .catch(() => {})
            .finally(() => setLoadingSummary(false));

        apiClient.get("/api/flashcards/stats")
            .then(async (res) => { if (res?.ok) setFcStats(await res.json()); })
            .catch(() => {});

        apiClient.get("/api/assignments/suggestions")
            .then(async (res) => { if (res?.ok) { const d = await res.json(); setSuggestions((d.suggestions || []).slice(0, 5)); } })
            .catch(() => {})
            .finally(() => setLoadingSuggestions(false));
    }, [fetchLinkedAccounts]);

    const updateAccountTitle = async (accountId, newTitle) => {
        await apiClient.patch(`/api/linked-accounts/${accountId}/update-title`, { title: newTitle });
        fetchLinkedAccounts();
    };
    const deleteAccount = async (accountId) => {
        await apiClient.delete(`/api/linked-accounts/${accountId}`);
        fetchLinkedAccounts();
    };

    const streak = user?.study_streak || 0;
    const dueToday = fcStats ? Number(fcStats.due_today || 0) : 0;
    const greeting = (() => {
        const h = new Date().getHours();
        return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    })();

    return (
        <DashboardLayout>
            {/* Greeting */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-ink">{greeting}{user?.username ? `, ${user.username}` : ""}</h1>
                <p className="text-sm text-ink-faint mt-0.5">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
            </div>

            {/* Stat bento */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <GradeHero summary={summary} loading={loadingSummary} />
                <StatTile
                    label="Flashcards due"
                    value={dueToday}
                    sub={dueToday > 0 ? "Ready to review" : "All caught up"}
                    accent="text-brand"
                    href="/flashcards/review"
                    hrefLabel="Review"
                    delay={60}
                />
                <StatTile
                    label="Study streak"
                    value={`${streak}`}
                    sub={streak > 0 ? "days in a row 🔥" : "Start one today"}
                    accent="text-warning"
                    delay={120}
                />
            </div>

            {/* Content bento */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                <DueSoonTile suggestions={suggestions} loading={loadingSuggestions} delay={180} />
                <QuickActionsTile delay={240} />
            </div>

            {/* Linked accounts */}
            <h2 className="text-lg font-semibold text-ink mb-3">Linked accounts</h2>
            {loadingAccounts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-6">
                            <div className="skeleton h-4 w-3/4 mb-4" />
                            <div className="skeleton h-3 w-1/2 mb-2" />
                            <div className="skeleton h-3 w-2/3" />
                        </div>
                    ))}
                </div>
            ) : linkedAccounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
                <div className="card text-center py-12 mb-8">
                    <p className="text-ink-soft text-base mb-1">No LMS accounts linked yet.</p>
                    <p className="text-ink-faint text-sm">Connect your Canvas account below to get started.</p>
                </div>
            )}

            <div id="link-account" className="mb-6">
                <CanvasLinker onLinkSuccess={fetchLinkedAccounts} />
            </div>

            <div className="mb-2">
                <CalendarView />
            </div>
        </DashboardLayout>
    );
}

export default withAuth(DashboardPage);
