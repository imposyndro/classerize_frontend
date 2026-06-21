"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountCard({ account, onUpdateTitle, onDelete }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(account.title || account.lms_name || "Unknown LMS");
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleSave = () => {
        setIsEditing(false);
        if (title !== (account.title || account.lms_name)) {
            onUpdateTitle?.(account.account_id, title);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6 flex flex-col gap-3">
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
                            className="flex-1 border-b-2 border-blue-500 focus:outline-none text-gray-800 font-semibold text-lg"
                        />
                    ) : (
                        <h2 className="text-lg font-semibold text-gray-800 truncate">{title}</h2>
                    )}
                </div>
                <div className="flex gap-2 ml-2 shrink-0">
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                            Save
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300"
                        >
                            Rename
                        </button>
                    )}
                </div>
            </div>

            {/* Meta */}
            <p className="text-xs text-gray-400 truncate">{account.api_base_url || "No URL"}</p>
            <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full w-fit">
                {account.lms_name}
            </span>

            {/* Courses */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Courses</h3>
                {account.courses?.filter((c) => c.name && c.id).length > 0 ? (
                    <ul className="space-y-1">
                        {account.courses
                            .filter((c) => c.name && c.id)
                            .map((course) => (
                                <li key={`${account.account_id}-${course.id}`}>
                                    <button
                                        onClick={() => router.push(`/course/${course.id}`)}
                                        className="w-full text-left text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition truncate"
                                    >
                                        {course.name}
                                        {course.course_code && (
                                            <span className="text-blue-400 ml-1">({course.course_code})</span>
                                        )}
                                    </button>
                                </li>
                            ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-400">No courses found.</p>
                )}
            </div>

            {/* Delete */}
            <div className="pt-2 border-t border-gray-100">
                {confirmDelete ? (
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-500">Remove this account?</span>
                        <button
                            onClick={() => onDelete?.(account.account_id)}
                            className="text-xs text-red-600 font-medium hover:underline"
                        >
                            Yes, remove
                        </button>
                        <button
                            onClick={() => setConfirmDelete(false)}
                            className="text-xs text-gray-400 hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="text-xs text-gray-400 hover:text-red-500 transition"
                    >
                        Remove account
                    </button>
                )}
            </div>
        </div>
    );
}
