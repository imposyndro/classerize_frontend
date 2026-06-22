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

    if (loading) return <DashboardLayout><div className="py-16 text-center text-gray-400">Loading…</div></DashboardLayout>;
    if (notFound) return (
        <DashboardLayout>
            <div className="py-16 text-center text-gray-400">
                <p className="mb-3">Deck not found.</p>
                <Link href="/flashcards" className="text-blue-600 hover:underline">Back to decks</Link>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto py-8 px-4">
                <Link href="/flashcards" className="text-sm text-blue-600 hover:underline">← Back to decks</Link>

                <div className="flex items-start justify-between gap-4 mt-3 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{deck.title}</h1>
                        {deck.description && <p className="text-sm text-gray-500 mt-1">{deck.description}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                            {cards.length} card{cards.length === 1 ? "" : "s"}
                            {deck.course_name && <> · {deck.course_name}</>}
                            {deck.source === "ai" && <> · AI-generated</>}
                        </p>
                    </div>
                    {dueCount > 0 && (
                        <Link href={`/flashcards/review?deck_id=${id}`}
                              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 shrink-0">
                            Study {dueCount} due →
                        </Link>
                    )}
                </div>

                {/* Add card */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Add a card</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                        <textarea placeholder="Front (question)" value={front} onChange={(e) => setFront(e.target.value)}
                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        <textarea placeholder="Back (answer)" value={back} onChange={(e) => setBack(e.target.value)}
                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <button onClick={addCard} disabled={adding || !front.trim() || !back.trim()}
                            className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                        {adding ? "Adding…" : "Add card"}
                    </button>
                </div>

                {/* Card list */}
                <div className="space-y-2">
                    {cards.length === 0 ? (
                        <p className="text-center text-gray-400 py-8 text-sm">No cards yet. Add one above.</p>
                    ) : cards.map((c) => (
                        <div key={c.card_id} className="bg-white rounded-lg border border-gray-100 p-3 flex items-start gap-3">
                            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.front}</p>
                                <p className="text-sm text-gray-500 whitespace-pre-wrap border-l border-gray-100 sm:pl-3">{c.back}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-xs text-gray-300" title={`ease ${c.ease_factor}, ${c.repetitions} reps`}>
                                    {new Date(c.due_date) <= new Date() ? <span className="text-red-400">due</span> : `in ${c.interval_days}d`}
                                </span>
                                <button onClick={() => deleteCard(c.card_id)} className="text-gray-300 hover:text-red-500 text-sm" title="Delete">🗑</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default withAuth(DeckDetailPage);
