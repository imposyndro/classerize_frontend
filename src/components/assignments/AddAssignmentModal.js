"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";

export default function AddAssignmentModal({ onClose, onCreated }) {
    const [courses, setCourses]   = useState([]);
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState(null);
    const [form, setForm]         = useState({
        course_id:       "",
        assignment_name: "",
        due_date:        "",
        points_possible: "",
        status:          "pending",
        description:     "",
    });

    useEffect(() => {
        apiClient.get("/api/courses").then(async (res) => {
            if (res?.ok) {
                const data = await res.json();
                setCourses(data.courses || []);
                if (data.courses?.length) setForm((f) => ({ ...f, course_id: String(data.courses[0].course_id) }));
            }
        });
    }, []);

    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!form.assignment_name.trim()) return setError("Assignment name is required.");
        if (!form.course_id)             return setError("Please select a course.");

        setSaving(true);
        try {
            const res = await apiClient.post("/api/assignments", {
                course_id:       Number(form.course_id),
                assignment_name: form.assignment_name.trim(),
                due_date:        form.due_date || undefined,
                points_possible: form.points_possible ? Number(form.points_possible) : undefined,
                status:          form.status,
                description:     form.description || undefined,
            });
            if (res?.ok) {
                onCreated?.();
                onClose();
            } else {
                const data = await res?.json();
                setError(data?.error || "Failed to create assignment.");
            }
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full bg-surface text-ink border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fade-in"
             onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-surface border border-line rounded-tile shadow-lg w-full max-w-md p-6 animate-pop-in">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-ink">Add Assignment</h2>
                    <button onClick={onClose} className="text-ink-faint hover:text-ink text-xl leading-none">×</button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Course */}
                    <div>
                        <label className="block text-sm font-medium text-ink-soft mb-1">Course</label>
                        <select value={form.course_id} onChange={(e) => set("course_id", e.target.value)}
                                className={inputCls}>
                            {courses.map((c) => (
                                <option key={c.course_id} value={c.course_id}>
                                    {c.course_name}{c.course_code ? ` (${c.course_code})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-ink-soft mb-1">Assignment name *</label>
                        <input type="text" value={form.assignment_name}
                               onChange={(e) => set("assignment_name", e.target.value)}
                               placeholder="e.g. Problem Set 5"
                               className={inputCls} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Due date */}
                        <div>
                            <label className="block text-sm font-medium text-ink-soft mb-1">Due date</label>
                            <input type="date" value={form.due_date}
                                   onChange={(e) => set("due_date", e.target.value)}
                                   className={inputCls} />
                        </div>

                        {/* Points */}
                        <div>
                            <label className="block text-sm font-medium text-ink-soft mb-1">Points possible</label>
                            <input type="number" min="0" step="0.5" value={form.points_possible}
                                   onChange={(e) => set("points_possible", e.target.value)}
                                   placeholder="100"
                                   className={inputCls} />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-ink-soft mb-1">Status</label>
                        <select value={form.status} onChange={(e) => set("status", e.target.value)}
                                className={inputCls}>
                            <option value="pending">Pending</option>
                            <option value="submitted">Submitted</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-ink-soft mb-1">Notes (optional)</label>
                        <textarea value={form.description} rows={2}
                                  onChange={(e) => set("description", e.target.value)}
                                  placeholder="Any notes about this assignment…"
                                  className={`${inputCls} resize-none`} />
                    </div>

                    {error && <p className="text-sm text-danger">{error}</p>}

                    <div className="flex justify-end gap-3 pt-1">
                        <button type="button" onClick={onClose}
                                className="text-sm px-4 py-2 rounded-lg border border-line text-ink-soft hover:bg-subtle">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                                className="text-sm px-4 py-2 rounded-lg bg-brand text-brand-fg hover:bg-brand-hover disabled:opacity-50 transition">
                            {saving ? "Saving…" : "Add Assignment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
