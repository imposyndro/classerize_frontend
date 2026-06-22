"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { withAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import apiClient from "@/lib/apiClient";

// Anki-style recall buttons → SM-2 quality (0–5)
const RATINGS = [
    { label: "Again", quality: 1, color: "var(--danger)",  hint: "Forgot" },
    { label: "Hard",  quality: 3, color: "var(--warning)", hint: "Tough" },
    { label: "Good",  quality: 4, color: "var(--brand)",   hint: "Recalled" },
    { label: "Easy",  quality: 5, color: "var(--success)", hint: "Trivial" },
];

function ReviewInner() {
    const searchParams = useSearchParams();
    const deckId = searchParams.get("deck_id");

    const [queue, setQueue]     = useState([]);
    const [idx, setIdx]         = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reviewed, setReviewed] = useState(0);

    const load = useCallback(async () => {
        setLoading(true);
        const url = deckId ? `/api/flashcards/due?deck_id=${deckId}` : "/api/flashcards/due";
        const res = await apiClient.get(url);
        if (res?.ok) setQueue((await res.json()).cards || []);
        setIdx(0); setFlipped(false); setReviewed(0);
        setLoading(false);
    }, [deckId]);

    useEffect(() => { load(); }, [load]);

    const current = queue[idx];

    const rate = async (quality) => {
        if (!current) return;
        // Optimistically advance; fire the review in the background.
        apiClient.post(`/api/flashcards/cards/${current.card_id}/review`, { quality }).catch(() => {});
        setReviewed((r) => r + 1);
        setFlipped(false);
        setIdx((i) => i + 1);
    };

    // Keyboard: space flips, 1–4 rate
    useEffect(() => {
        const handler = (e) => {
            if (e.key === " ") { e.preventDefault(); setFlipped((f) => !f); }
            if (flipped && ["1", "2", "3", "4"].includes(e.key)) rate(RATINGS[Number(e.key) - 1].quality);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [flipped, current]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return <DashboardLayout><div className="max-w-2xl mx-auto py-16 text-center text-ink-faint">Loading cards…</div></DashboardLayout>;
    }

    const done = !current;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/flashcards" className="text-sm text-brand hover:underline">← Back to decks</Link>
                    {!done && <span className="text-sm text-ink-faint tabular-nums">{idx + 1} / {queue.length}</span>}
                </div>

                {done ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">{reviewed > 0 ? "🎉" : "✅"}</div>
                        <h1 className="text-2xl font-bold text-ink mb-2">
                            {reviewed > 0 ? "Session complete!" : "Nothing due right now"}
                        </h1>
                        <p className="text-ink-soft mb-8">
                            {reviewed > 0 ? `You reviewed ${reviewed} card${reviewed === 1 ? "" : "s"}.` : "Come back later, or study ahead from a deck."}
                        </p>
                        <Link href="/flashcards" className="bg-brand text-brand-fg px-5 py-2.5 rounded-tile font-semibold hover:bg-brand-hover">
                            Back to decks
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Progress bar */}
                        <div className="h-1 bg-subtle rounded-full mb-6 overflow-hidden">
                            <div className="h-full bg-brand transition-all" style={{ width: `${(idx / queue.length) * 100}%` }} />
                        </div>

                        {/* Card (3D flip) */}
                        <div style={{ perspective: "1200px" }} className="cursor-pointer select-none" onClick={() => setFlipped((f) => !f)}>
                            <div className={`relative h-72 transition-transform duration-500 ease-out-soft [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}>
                                {/* Front */}
                                <div className="absolute inset-0 [backface-visibility:hidden] bg-surface rounded-tile shadow-lg border border-line flex flex-col items-center justify-center p-8 text-center overflow-auto">
                                    {current.deck_title && <p className="text-xs text-ink-faint mb-3 uppercase tracking-wide">{current.deck_title}</p>}
                                    <p className="text-xl font-medium text-ink whitespace-pre-wrap">{current.front}</p>
                                    <p className="mt-4 text-xs text-ink-faint">Tap or press space to flip</p>
                                </div>
                                {/* Back */}
                                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-surface rounded-tile shadow-lg border border-line flex flex-col items-center justify-center p-8 text-center overflow-auto">
                                    <p className="text-xs text-ink-faint mb-3 uppercase tracking-wide">Answer</p>
                                    <p className="text-lg text-ink whitespace-pre-wrap">{current.back}</p>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        {!flipped ? (
                            <button onClick={() => setFlipped(true)}
                                    className="w-full mt-6 bg-ink text-surface py-3 rounded-tile font-semibold hover:opacity-90 transition">
                                Show answer <span className="opacity-50 text-sm">(space)</span>
                            </button>
                        ) : (
                            <div className="grid grid-cols-4 gap-2 mt-6">
                                {RATINGS.map((r, i) => (
                                    <button key={r.label} onClick={() => rate(r.quality)}
                                            className="py-3 rounded-tile text-white font-semibold transition hover:opacity-90 flex flex-col items-center"
                                            style={{ backgroundColor: r.color }}>
                                        <span>{r.label}</span>
                                        <span className="text-xs opacity-70 font-normal">{i + 1}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

function ReviewPage() {
    return (
        <Suspense fallback={<DashboardLayout><div className="py-16 text-center text-ink-faint">Loading…</div></DashboardLayout>}>
            <ReviewInner />
        </Suspense>
    );
}

export default withAuth(ReviewPage);
