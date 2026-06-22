"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

export default function AccountCard({ account, onUpdateTitle, onDelete, onSyncSuccess }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(account.title || account.lms_name || "Unknown LMS");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);

    const handleSync = async () => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const res = await apiClient.post(`/api/lms/sync/${account.account_id}`);
            const data = res?.ok ? await res.json() : null;
            setSyncResult(data ? { ok: true, text: `Synced: ${data.coursesUpserted ?? 0} courses, ${data.assignmentsUpserted ?? 0} assignments` } : { ok: false, text: "Sync failed." });
            onSyncSuccess?.();
        } catch {
            setSyncResult({ ok: false, text: "Sync error." });
        } finally {
            setSyncing(false);
        }
    };

    const handleSave = () => {
        setIsEditing(false);
        if (title !== (account.title || account.lms_name)) {
            onUpdateTitle?.(account.account_id, title);
        }
    };

    return (
        <div className="card p-6 flex flex-col gap-3 transition-transform duration-base hover:-translate-y-0.5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isEditing ? (
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSave()}
                            autoFocus
                            className="flex-1 bg-transparent border-b-2 border-brand focus:outline-none text-ink font-semibold text-lg"
                        />
                    ) : (
                        <h2 className="text-lg font-semibold text-ink truncate">{title}</h2>
                    )}
                </div>
                <div className="flex gap-2 ml-2 shrink-0">
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            className="px-3 py-1 bg-success text-white text-xs rounded-lg hover:opacity-90 transition"
                        >
                            Save
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1 bg-subtle text-ink-soft text-xs rounded-lg hover:bg-line transition"
                        >
                            Rename
                        </button>
                    )}
                </div>
            </div>

            {/* Meta */}
            <p className="text-xs text-ink-faint truncate">{account.api_base_url || "No URL"}</p>
            <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-block text-xs bg-brand-subtle text-brand px-2 py-0.5 rounded-full font-medium">
                    {account.lms_name}
                </span>
                {account.last_synced && (
                    <span className="text-xs text-ink-faint">
                        Last synced: {new Date(account.last_synced).toLocaleString()}
                    </span>
                )}
            </div>

            {/* Sync */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="text-xs bg-brand text-brand-fg px-3 py-1.5 rounded-lg hover:bg-brand-hover transition disabled:opacity-50"
                >
                    {syncing ? "Syncing…" : "Sync Now"}
                </button>
                {syncResult && (
                    <span className={`text-xs ${syncResult.ok ? "text-success" : "text-danger"}`}>
                        {syncResult.text}
                    </span>
                )}
            </div>

            {/* Courses */}
            <div>
                <h3 className="text-sm font-semibold text-ink-soft mb-2">Courses</h3>
                {account.courses?.filter((c) => c.name && c.id).length > 0 ? (
                    <ul className="space-y-1">
                        {account.courses
                            .filter((c) => c.name && c.id)
                            .map((course) => (
                                <li key={`${account.account_id}-${course.id}`}>
                                    <button
                                        onClick={() => router.push(`/course/${course.id}`)}
                                        className="w-full text-left text-sm px-3 py-1.5 bg-brand-subtle text-brand rounded-lg hover:brightness-95 transition truncate"
                                    >
                                        {course.name}
                                        {course.course_code && (
                                            <span className="opacity-60 ml-1">({course.course_code})</span>
                                        )}
                                    </button>
                                </li>
                            ))}
                    </ul>
                ) : (
                    <p className="text-sm text-ink-faint">No courses found.</p>
                )}
            </div>

            {/* Delete */}
            <div className="pt-2 border-t border-line">
                {confirmDelete ? (
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-ink-soft">Remove this account?</span>
                        <button
                            onClick={() => onDelete?.(account.account_id)}
                            className="text-xs text-danger font-medium hover:underline"
                        >
                            Yes, remove
                        </button>
                        <button
                            onClick={() => setConfirmDelete(false)}
                            className="text-xs text-ink-faint hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="text-xs text-ink-faint hover:text-danger transition"
                    >
                        Remove account
                    </button>
                )}
            </div>
        </div>
    );
}
