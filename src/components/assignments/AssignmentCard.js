"use client";

import { useState } from "react";

const STATUS_STYLES = {
    pending:   "bg-yellow-100 text-yellow-700",
    submitted: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    excused:   "bg-gray-100 text-gray-500",
};

export default function AssignmentCard({ assignment, onMarkStatus }) {
    const [showSummary, setShowSummary] = useState(false);
    const isPastDue = assignment.due_date && new Date(assignment.due_date) < new Date();

    return (
        <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{assignment.assignment_name}</p>
                    <p className="text-xs text-gray-500 truncate">
                        {assignment.course_name}
                        {assignment.course_code && <span className="ml-1 text-gray-400">({assignment.course_code})</span>}
                    </p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[assignment.status] || STATUS_STYLES.pending}`}>
                    {assignment.status || "pending"}
                </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className={isPastDue && assignment.status === "pending" ? "text-red-500 font-medium" : ""}>
                    {assignment.due_date
                        ? `Due: ${new Date(assignment.due_date).toLocaleDateString()}`
                        : "No due date"}
                    {isPastDue && assignment.status === "pending" && " — OVERDUE"}
                </span>
                {assignment.points_possible && (
                    <span>{assignment.points_possible} pts</span>
                )}
                <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                    {assignment.lms_name}
                </span>
            </div>

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
        </div>
    );
}
