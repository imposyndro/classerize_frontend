"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchOpen, setSearchOpen]   = useState(false);
    const [query, setQuery]             = useState("");
    const [results, setResults]         = useState(null);
    const [searching, setSearching]     = useState(false);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    // Fetch unread notifications
    useEffect(() => {
        if (!user) return;
        apiClient.get("/api/notifications")
            .then(async (res) => {
                if (!res?.ok) return;
                const data = await res.json();
                setUnreadCount((data.notifications || []).filter((n) => !n.read_at).length);
            })
            .catch(() => {});
    }, [user]);

    // Ping streak once per session
    useEffect(() => {
        if (!user) return;
        apiClient.post("/api/users/ping").catch(() => {});
    }, [user]);

    // Keyboard shortcut: ⌘K / Ctrl+K
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen(true);
                setTimeout(() => searchRef.current?.focus(), 50);
            }
            if (e.key === "Escape") {
                setSearchOpen(false);
                setQuery("");
                setResults(null);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const handleSearch = (q) => {
        setQuery(q);
        clearTimeout(debounceRef.current);
        if (q.trim().length < 2) { setResults(null); return; }
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            const res = await apiClient.get(`/api/search?q=${encodeURIComponent(q.trim())}`);
            if (res?.ok) setResults(await res.json());
            setSearching(false);
        }, 300);
    };

    const goToSearch = (e) => {
        if (e.key === "Enter" && query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            setSearchOpen(false);
            setQuery("");
            setResults(null);
        }
    };

    const streak = user?.study_streak || 0;

    return (
        <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-[color:var(--surface-translucent)] px-6 py-3 backdrop-blur-md">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-brand-fg text-sm font-bold">C</span>
                <span className="text-lg font-bold tracking-tight text-ink">Classerize</span>
            </Link>

            <div className="flex items-center gap-3">
                {loading ? (
                    <span className="text-ink-faint text-sm">Loading…</span>
                ) : user ? (
                    <>
                        {/* Search trigger */}
                        <button
                            onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }}
                            className="flex items-center gap-1.5 rounded-lg border border-line bg-subtle px-3 py-1.5 text-sm text-ink-soft transition-colors duration-base hover:bg-line"
                            title="Search (⌘K)"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="hidden sm:inline">Search</span>
                            <kbd className="hidden sm:inline text-xs text-ink-faint">⌘K</kbd>
                        </button>

                        {/* Study streak */}
                        {streak > 0 && (
                            <span className="hidden sm:flex items-center gap-1 text-sm font-semibold bg-warning-subtle text-warning px-2.5 py-1 rounded-full"
                                  title={`${streak}-day study streak`}>
                                🔥 {streak}
                            </span>
                        )}

                        {/* Theme toggle */}
                        <ThemeToggle />

                        {/* Notification bell */}
                        <Link href="/notifications" className="relative text-ink-soft transition-colors hover:text-ink">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
                                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </Link>

                        <span className="text-sm text-ink-soft hidden sm:inline">
                            <strong className="text-ink font-semibold">{user.username}</strong>
                        </span>
                        <button
                            onClick={logout}
                            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors duration-base hover:bg-subtle hover:text-ink"
                        >
                            Logout
                        </button>
                    </>
                ) : null}
            </div>

            {/* Search overlay */}
            {searchOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-sm px-4 animate-fade-in"
                     onClick={(e) => { if (e.target === e.currentTarget) { setSearchOpen(false); setQuery(""); setResults(null); } }}>
                    <div className="bg-surface rounded-tile shadow-lg w-full max-w-lg overflow-hidden border border-line animate-pop-in">
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
                            <svg className="w-5 h-5 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={searchRef}
                                type="text" value={query}
                                onChange={(e) => handleSearch(e.target.value)}
                                onKeyDown={goToSearch}
                                placeholder="Search assignments and courses… (Enter for all)"
                                className="flex-1 bg-transparent text-sm text-ink placeholder-ink-faint outline-none"
                            />
                            {searching && <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />}
                            <button onClick={() => { setSearchOpen(false); setQuery(""); setResults(null); }}
                                    className="text-ink-faint hover:text-ink text-xl leading-none">×</button>
                        </div>

                        {results && (
                            <div className="max-h-72 overflow-y-auto text-ink">
                                {results.assignments?.length > 0 && (
                                    <div>
                                        <p className="text-xs text-ink-faint font-medium px-4 pt-3 pb-1 uppercase tracking-wide">Assignments</p>
                                        {results.assignments.map((a) => (
                                            <Link key={a.assignment_id} href="/assignments"
                                                  onClick={() => { setSearchOpen(false); setQuery(""); setResults(null); }}
                                                  className="flex items-center gap-3 px-4 py-2 hover:bg-subtle transition-colors">
                                                <div className="w-2.5 h-2.5 rounded-full shrink-0"
                                                     style={{ backgroundColor: a.color || "#6B7280" }} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{a.assignment_name}</p>
                                                    <p className="text-xs text-ink-faint">{a.course_name}</p>
                                                </div>
                                                <span className="text-xs text-ink-faint shrink-0">
                                                    {a.due_date ? new Date(a.due_date).toLocaleDateString() : ""}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                {results.courses?.length > 0 && (
                                    <div>
                                        <p className="text-xs text-ink-faint font-medium px-4 pt-3 pb-1 uppercase tracking-wide">Courses</p>
                                        {results.courses.map((c) => (
                                            <Link key={c.course_id} href="/gradebook"
                                                  onClick={() => { setSearchOpen(false); setQuery(""); setResults(null); }}
                                                  className="flex items-center gap-3 px-4 py-2 hover:bg-subtle transition-colors">
                                                <div className="w-2.5 h-2.5 rounded-full shrink-0"
                                                     style={{ backgroundColor: c.color || "#6B7280" }} />
                                                <div>
                                                    <p className="text-sm font-medium">{c.course_name}</p>
                                                    <p className="text-xs text-ink-faint">{c.course_code}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                {results.assignments?.length === 0 && results.courses?.length === 0 && (
                                    <p className="text-sm text-ink-faint px-4 py-6 text-center">No results for "{query}"</p>
                                )}
                            </div>
                        )}

                        {!results && query.length < 2 && (
                            <p className="text-xs text-ink-faint px-4 py-3">Type at least 2 characters to search</p>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
