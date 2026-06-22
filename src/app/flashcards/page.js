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
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-ink">Flashcards</h1>
                    <div className="flex gap-2">
                        <button onClick={() => setModal("manual")}
                                className="text-sm px-3 py-2 rounded-lg border border-line text-ink-soft hover:bg-subtle transition">
                            + New deck
                        </button>
                        <button onClick={() => setModal("ai")}
                                className="text-sm px-3 py-2 rounded-lg bg-brand text-brand-fg font-medium hover:bg-brand-hover transition">
                            ✨ Generate with AI
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <StatCard label="Total cards"     value={stats.total_cards}    accent="text-brand" />
                    <StatCard label="Due today"        value={stats.due_today}      accent="text-danger" />
                    <StatCard label="Reviewed today"   value={stats.reviewed_today} accent="text-success" />
                </div>

                {stats.due_today > 0 && (
                    <button
                        onClick={() => router.push("/flashcards/review")}
                        className="w-full mb-6 bg-brand text-brand-fg py-3 rounded-tile font-semibold hover:bg-brand-hover transition"
                    >
                        Review {stats.due_today} due card{stats.due_today === 1 ? "" : "s"} →
                    </button>
                )}

                {/* Deck grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-tile" />)}
                    </div>
                ) : decks.length === 0 ? (
                    <div className="text-center py-16 text-ink-faint">
                        <p className="text-lg mb-1">No flashcard decks yet.</p>
                        <p className="text-sm">Generate one with AI or create a deck manually to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {decks.map((d) => (
                            <div key={d.deck_id} className="card-tile p-4 flex flex-col transition-transform duration-base hover:-translate-y-0.5"
                                 style={{ borderTopColor: d.color || "var(--brand)", borderTopWidth: 3 }}>
                                <div className="flex items-start justify-between gap-2">
                                    <Link href={`/flashcards/${d.deck_id}`} className="flex-1 min-w-0">
                                        <p className="font-semibold text-ink truncate hover:text-brand transition-colors">{d.title}</p>
                                        {d.course_name && <p className="text-xs text-ink-faint truncate">{d.course_name}</p>}
                                    </Link>
                                    {d.source === "ai" && <span className="text-xs bg-brand-subtle text-brand px-1.5 py-0.5 rounded shrink-0">AI</span>}
                                </div>
                                <div className="flex items-center gap-3 mt-3 text-sm text-ink-soft">
                                    <span>{d.card_count} card{d.card_count === 1 ? "" : "s"}</span>
                                    {d.due_count > 0 && <span className="text-danger font-medium">{d.due_count} due</span>}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Link href={`/flashcards/review?deck_id=${d.deck_id}`}
                                          className={`flex-1 text-center text-sm py-1.5 rounded-lg font-medium transition ${
                                              d.due_count > 0 ? "bg-brand text-brand-fg hover:bg-brand-hover" : "bg-subtle text-ink-faint pointer-events-none"
                                          }`}>
                                        Study
                                    </Link>
                                    <Link href={`/flashcards/${d.deck_id}`}
                                          className="text-sm py-1.5 px-3 rounded-lg border border-line text-ink-soft hover:bg-subtle transition">
                                        Manage
                                    </Link>
                                    <button onClick={() => deleteDeck(d.deck_id)}
                                            className="text-sm py-1.5 px-2 rounded-lg text-ink-faint hover:text-danger transition" title="Delete deck">
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

function StatCard({ label, value, accent }) {
    return (
        <div className="card p-4">
            <p className={`text-3xl font-bold tabular-nums ${accent}`}>{value}</p>
            <p className="text-xs text-ink-faint mt-1 uppercase tracking-wide">{label}</p>
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
            {error && <p className="text-sm text-danger mb-3">{error}</p>}
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
                    className="w-full bg-brand text-brand-fg py-2 rounded-lg font-medium hover:bg-brand-hover disabled:opacity-50">
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
                    className="w-full bg-brand text-brand-fg py-2 rounded-lg font-medium hover:bg-brand-hover disabled:opacity-50">
                {busy ? "Creating…" : "Create deck"}
            </button>
        </Modal>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-surface border border-line rounded-tile shadow-lg w-full max-w-md p-6 animate-pop-in">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-ink">{title}</h2>
                    <button onClick={onClose} className="text-ink-faint hover:text-ink text-xl">×</button>
                </div>
                {children}
            </div>
            <style jsx global>{`
                .modal-input { width:100%; background:var(--bg-surface); color:var(--text-primary); border:1px solid var(--border); border-radius:0.5rem; padding:0.5rem 0.75rem; font-size:0.875rem; outline:none; }
                .modal-input:focus { border-color:var(--brand); box-shadow:0 0 0 1px var(--brand); }
            `}</style>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div className="mb-3 flex-1">
            <label className="block text-xs font-medium text-ink-soft mb-1">{label}</label>
            {children}
        </div>
    );
}

export default withAuth(FlashcardsPage);
