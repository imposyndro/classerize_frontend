"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { withAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import apiClient from "@/lib/apiClient";

function FlashcardsPage() {
    const router = useRouter();
    const [decks, setDecks]   = useState([]);
    const [stats, setStats]   = useState({ total_cards: 0, due_today: 0, reviewed_today: 0 });
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal]   = useState(null); // 'ai' | 'manual' | null

    const load = useCallback(async () => {
        setLoading(true);
        const [dRes, sRes, cRes] = await Promise.all([
            apiClient.get("/api/flashcards/decks"),
            apiClient.get("/api/flashcards/stats"),
            apiClient.get("/api/courses"),
        ]);
        if (dRes?.ok) setDecks((await dRes.json()).decks || []);
        if (sRes?.ok) setStats(await sRes.json());
        if (cRes?.ok) setCourses((await cRes.json()).courses || []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const deleteDeck = async (id) => {
        if (!confirm("Delete this deck and all its cards?")) return;
        await apiClient.delete(`/api/flashcards/decks/${id}`);
        setDecks((prev) => prev.filter((d) => d.deck_id !== id));
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto py-8 px-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
                    <div className="flex gap-2">
                        <button onClick={() => setModal("manual")}
                                className="text-sm px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                            + New deck
                        </button>
                        <button onClick={() => setModal("ai")}
                                className="text-sm px-3 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700">
                            ✨ Generate with AI
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <StatCard label="Total cards"     value={stats.total_cards} color="#6366F1" />
                    <StatCard label="Due today"        value={stats.due_today}   color="#EF4444" />
                    <StatCard label="Reviewed today"   value={stats.reviewed_today} color="#10B981" />
                </div>

                {stats.due_today > 0 && (
                    <button
                        onClick={() => router.push("/flashcards/review")}
                        className="w-full mb-6 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                        Review {stats.due_today} due card{stats.due_today === 1 ? "" : "s"} →
                    </button>
                )}

                {/* Deck grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
                    </div>
                ) : decks.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-lg mb-1">No flashcard decks yet.</p>
                        <p className="text-sm">Generate one with AI or create a deck manually to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {decks.map((d) => (
                            <div key={d.deck_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col"
                                 style={{ borderTopColor: d.color || "#6366F1", borderTopWidth: 3 }}>
                                <div className="flex items-start justify-between gap-2">
                                    <Link href={`/flashcards/${d.deck_id}`} className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 truncate hover:text-blue-600">{d.title}</p>
                                        {d.course_name && <p className="text-xs text-gray-400 truncate">{d.course_name}</p>}
                                    </Link>
                                    {d.source === "ai" && <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded shrink-0">AI</span>}
                                </div>
                                <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                                    <span>{d.card_count} card{d.card_count === 1 ? "" : "s"}</span>
                                    {d.due_count > 0 && <span className="text-red-500 font-medium">{d.due_count} due</span>}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Link href={`/flashcards/review?deck_id=${d.deck_id}`}
                                          className={`flex-1 text-center text-sm py-1.5 rounded-lg font-medium transition ${
                                              d.due_count > 0 ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-400 pointer-events-none"
                                          }`}>
                                        Study
                                    </Link>
                                    <Link href={`/flashcards/${d.deck_id}`}
                                          className="text-sm py-1.5 px-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                                        Manage
                                    </Link>
                                    <button onClick={() => deleteDeck(d.deck_id)}
                                            className="text-sm py-1.5 px-2 rounded-lg text-gray-300 hover:text-red-500" title="Delete deck">
                                        🗑
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {modal === "ai" && <GenerateModal courses={courses} onClose={() => setModal(null)} onDone={load} />}
            {modal === "manual" && <ManualModal courses={courses} onClose={() => setModal(null)} onDone={load} />}
        </DashboardLayout>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">{label}</p>
        </div>
    );
}

function GenerateModal({ courses, onClose, onDone }) {
    const [form, setForm] = useState({ topic: "", title: "", source_text: "", count: 10, course_id: "" });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const submit = async () => {
        if (!form.topic.trim()) { setError("Enter a topic."); return; }
        setBusy(true); setError("");
        const res = await apiClient.post("/api/flashcards/generate", {
            topic: form.topic.trim(),
            title: form.title.trim() || form.topic.trim(),
            source_text: form.source_text.trim() || undefined,
            count: Number(form.count) || 10,
            course_id: form.course_id ? Number(form.course_id) : undefined,
        });
        setBusy(false);
        if (res?.ok) { onDone(); onClose(); }
        else { const d = await res.json().catch(() => ({})); setError(d.error || "Generation failed."); }
    };

    return (
        <Modal title="Generate flashcards with AI" onClose={onClose}>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <Field label="Topic *">
                <input className="modal-input" value={form.topic} placeholder="e.g. Krebs cycle"
                       onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            </Field>
            <Field label="Deck title (optional)">
                <input className="modal-input" value={form.title} placeholder="Defaults to the topic"
                       onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <div className="flex gap-3">
                <Field label="Number of cards">
                    <input type="number" min="1" max="30" className="modal-input" value={form.count}
                           onChange={(e) => setForm({ ...form, count: e.target.value })} />
                </Field>
                <Field label="Course (optional)">
                    <select className="modal-input" value={form.course_id}
                            onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
                        <option value="">None</option>
                        {courses.map((c) => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
                    </select>
                </Field>
            </div>
            <Field label="Source material (optional — paste notes for grounded cards)">
                <textarea className="modal-input h-24 resize-none" value={form.source_text}
                          onChange={(e) => setForm({ ...form, source_text: e.target.value })} />
            </Field>
            <button onClick={submit} disabled={busy}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                {busy ? "Generating…" : "Generate"}
            </button>
        </Modal>
    );
}

function ManualModal({ courses, onClose, onDone }) {
    const [form, setForm] = useState({ title: "", description: "", course_id: "" });
    const [busy, setBusy] = useState(false);
    const submit = async () => {
        if (!form.title.trim()) return;
        setBusy(true);
        const res = await apiClient.post("/api/flashcards/decks", {
            title: form.title.trim(), description: form.description.trim() || undefined,
            course_id: form.course_id ? Number(form.course_id) : undefined,
        });
        setBusy(false);
        if (res?.ok) { onDone(); onClose(); }
    };
    return (
        <Modal title="New deck" onClose={onClose}>
            <Field label="Title *">
                <input className="modal-input" value={form.title}
                       onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Description (optional)">
                <input className="modal-input" value={form.description}
                       onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Course (optional)">
                <select className="modal-input" value={form.course_id}
                        onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
                    <option value="">None</option>
                    {courses.map((c) => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
                </select>
            </Field>
            <button onClick={submit} disabled={busy}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                {busy ? "Creating…" : "Create deck"}
            </button>
        </Modal>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                </div>
                {children}
            </div>
            <style jsx global>{`
                .modal-input { width:100%; border:1px solid #d1d5db; border-radius:0.5rem; padding:0.5rem 0.75rem; font-size:0.875rem; outline:none; }
                .modal-input:focus { border-color:#6366f1; box-shadow:0 0 0 1px #6366f1; }
            `}</style>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div className="mb-3 flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            {children}
        </div>
    );
}

export default withAuth(FlashcardsPage);
