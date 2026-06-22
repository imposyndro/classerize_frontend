"use client";

import { useState, useCallback } from "react";
import apiClient from "@/lib/apiClient";

const STATUS_STYLES = {
    pending:   "bg-yellow-100 text-yellow-700",
    submitted: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    graded:    "bg-purple-100 text-purple-700",
    overdue:   "bg-red-100 text-red-700",
    excused:   "bg-gray-100 text-gray-500",
};

export default function AssignmentCard({ assignment, onMarkStatus, onProgressChange }) {
    const [showSummary, setShowSummary]   = useState(false);
    const [localProgress, setLocalProgress] = useState(assignment.progress ?? 0);
    const isPastDue = assignment.due_date && new Date(assignment.due_date) < new Date();
    const isGraded  = assignment.status === "graded" || assignment.status === "completed";
    const courseColor = assignment.color || "#6B7280";

    const handleProgressChange = useCallback(async (newVal) => {
        setLocalProgress(newVal);
        await apiClient.patch(`/api/assignments/${assignment.assignment_id}/progress`, { progress: newVal });
        onProgressChange?.();
    }, [assignment.assignment_id, onProgressChange]);

    const dueLabel = () => {
        if (!assignment.due_date) return "No due date";
        const d = new Date(assignment.due_date);
        const today = new Date();
        const diffDays = Math.round((d - today) / 864e5);
        if (diffDays === 0) return "Due today";
        if (diffDays === 1) return "Due tomorrow";
        if (diffDays === -1) return "Due yesterday";
        if (diffDays < 0) return `Due ${d.toLocaleDateString()} — OVERDUE`;
        if (diffDays <= 7) return `Due in ${diffDays} days`;
        return `Due ${d.toLocaleDateString()}`;
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2 border-l-4"
             style={{ borderLeftColor: courseColor }}>

            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 leading-tight">{assignment.assignment_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {assignment.course_name}
                        {assignment.course_code && <span className="ml-1 text-gray-400">({assignment.course_code})</span>}
                    </p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[assignment.status] || STATUS_STYLES.pending}`}>
                    {assignment.status || "pending"}
                </span>
            </div>

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500">
                <span className={isPastDue && !isGraded ? "text-red-500 font-medium" : ""}>
                    {dueLabel()}
                </span>
                {assignment.points_possible && (
                    <span>{assignment.points_possible} pts</span>
                )}
                <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                    {assignment.lms_name}
                </span>
            </div>

            {/* Progress bar — only for non-graded assignments */}
            {!isGraded && (
                <div className="mt-1">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${localProgress}%`, backgroundColor: courseColor }}
                            />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{localProgress}%</span>
                    </div>
                    <input
                        type="range" min="0" max="100" step="5"
                        value={localProgress}
                        onChange={(e) => setLocalProgress(Number(e.target.value))}
                        onMouseUp={(e) => handleProgressChange(Number(e.target.value))}
                        onTouchEnd={(e) => handleProgressChange(Number(e.target.value))}
                        className="w-full h-1 mt-1 cursor-pointer accent-blue-600 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
                        title="Drag to update progress"
                    />
                </div>
            )}

            {/* AI summary */}
            {assignment.ai_summary && (
                <div>
                    <button
                        onClick={() => setShowSummary(!showSummary)}
                        className="text-xs text-blue-500 hover:underline"
                    >
                        {showSummary ? "Hide AI summary" : "Show AI summary"}
                    </button>
                    {showSummary && (
                        <p className="mt-1 text-xs text-gray-600 bg-blue-50 rounded p-2">
                            {assignment.ai_summary}
                        </p>
                    )}
                </div>
            )}

            {/* Action buttons */}
            {!isGraded && (
                <div className="flex gap-2 mt-1">
                    {assignment.status !== "completed" && (
                        <button
                            onClick={() => onMarkStatus(assignment.assignment_id, "completed")}
                            className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                        >
                            Mark Complete
                        </button>
                    )}
                    {assignment.status !== "submitted" && assignment.status !== "completed" && (
                        <button
                            onClick={() => onMarkStatus(assignment.assignment_id, "submitted")}
                            className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition"
                        >
                            Mark Submitted
                        </button>
                    )}
                    {assignment.status !== "pending" && (
                        <button
                            onClick={() => onMarkStatus(assignment.assignment_id, "pending")}
                            className="text-xs text-gray-400 hover:text-gray-600"
                        >
                            Reset
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
