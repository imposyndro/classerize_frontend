"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { withAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import apiClient from "@/lib/apiClient";

function DeckDetailPage() {
    const { id } = useParams();
    const [deck, setDeck]   = useState(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [front, setFront] = useState("");
    const [back, setBack]   = useState("");
    const [adding, setAdding] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await apiClient.get(`/api/flashcards/decks/${id}`);
        if (res?.ok) {
            const data = await res.json();
            setDeck(data.deck);
            setCards(data.cards || []);
        } else if (res?.status === 404) {
            setNotFound(true);
        }
        setLoading(false);
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const addCard = async () => {
        if (!front.trim() || !back.trim()) return;
        setAdding(true);
        const res = await apiClient.post(`/api/flashcards/decks/${id}/cards`, { front: front.trim(), back: back.trim() });
        setAdding(false);
        if (res?.ok) { setFront(""); setBack(""); load(); }
    };

    const deleteCard = async (cardId) => {
        await apiClient.delete(`/api/flashcards/cards/${cardId}`);
        setCards((prev) => prev.filter((c) => c.card_id !== cardId));
    };

    const dueCount = cards.filter((c) => new Date(c.due_date) <= new Date()).length;

    const textCls = "bg-surface text-ink border border-line rounded-lg px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-1 focus:ring-brand";

    if (loading) return <DashboardLayout><div className="py-16 text-center text-ink-faint">Loading…</div></DashboardLayout>;
    if (notFound) return (
        <DashboardLayout>
            <div className="py-16 text-center text-ink-faint">
                <p className="mb-3">Deck not found.</p>
                <Link href="/flashcards" className="text-brand hover:underline">Back to decks</Link>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                <Link href="/flashcards" className="text-sm text-brand hover:underline">← Back to decks</Link>

                <div className="flex items-start justify-between gap-4 mt-3 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-ink">{deck.title}</h1>
                        {deck.description && <p className="text-sm text-ink-soft mt-1">{deck.description}</p>}
                        <p className="text-xs text-ink-faint mt-1">
                            {cards.length} card{cards.length === 1 ? "" : "s"}
                            {deck.course_name && <> · {deck.course_name}</>}
                            {deck.source === "ai" && <> · AI-generated</>}
                        </p>
                    </div>
                    {dueCount > 0 && (
                        <Link href={`/flashcards/review?deck_id=${id}`}
                              className="bg-brand text-brand-fg px-4 py-2 rounded-tile text-sm font-semibold hover:bg-brand-hover shrink-0">
                            Study {dueCount} due →
                        </Link>
                    )}
                </div>

                {/* Add card */}
                <div className="card-tile p-4 mb-6">
                    <p className="text-sm font-medium text-ink-soft mb-2">Add a card</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                        <textarea placeholder="Front (question)" value={front} onChange={(e) => setFront(e.target.value)}
                                  className={textCls} />
                        <textarea placeholder="Back (answer)" value={back} onChange={(e) => setBack(e.target.value)}
                                  className={textCls} />
                    </div>
                    <button onClick={addCard} disabled={adding || !front.trim() || !back.trim()}
                            className="text-sm bg-brand text-brand-fg px-4 py-1.5 rounded-lg font-medium hover:bg-brand-hover disabled:opacity-50">
                        {adding ? "Adding…" : "Add card"}
                    </button>
                </div>

                {/* Card list */}
                <div className="space-y-2">
                    {cards.length === 0 ? (
                        <p className="text-center text-ink-faint py-8 text-sm">No cards yet. Add one above.</p>
                    ) : cards.map((c) => (
                        <div key={c.card_id} className="card p-3 flex items-start gap-3">
                            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <p className="text-sm text-ink whitespace-pre-wrap">{c.front}</p>
                                <p className="text-sm text-ink-soft whitespace-pre-wrap border-l border-line sm:pl-3">{c.back}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-xs text-ink-faint" title={`ease ${c.ease_factor}, ${c.repetitions} reps`}>
                                    {new Date(c.due_date) <= new Date() ? <span className="text-danger">due</span> : `in ${c.interval_days}d`}
                                </span>
                                <button onClick={() => deleteCard(c.card_id)} className="text-ink-faint hover:text-danger text-sm" title="Delete">🗑</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default withAuth(DeckDetailPage);
