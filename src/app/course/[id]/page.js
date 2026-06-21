"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { withAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

function CoursePage({ params }) {
    // Next.js 15: params is a Promise when using async server components,
    // but in client components we unwrap with React.use()
    const { id } = use(params);
    const router = useRouter();
    const [course, setCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchCourse = async () => {
            try {
                // Fetch course details + assignments in parallel
                const [courseRes, assignmentsRes] = await Promise.all([
                    apiClient.get(`/api/courses/${id}`),
                    apiClient.get(`/api/assignments?courseId=${id}`),
                ]);

                if (courseRes?.ok) setCourse(await courseRes.json());
                if (assignmentsRes?.ok) {
                    const data = await assignmentsRes.json();
                    setAssignments(data.assignments || []);
                }
            } catch (err) {
                setError("Failed to load course details.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Loading course...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <button
                onClick={() => router.back()}
                className="mb-4 text-blue-600 hover:underline text-sm"
            >
                ← Back to Dashboard
            </button>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {course?.name || "Course Details"}
                </h1>
                <p className="text-gray-500 mt-1">{course?.course_code || ""}</p>
                <div className="mt-4 flex gap-6 text-sm text-gray-600">
                    <span>
                        <strong>Start:</strong>{" "}
                        {course?.start_at ? new Date(course.start_at).toLocaleDateString() : "N/A"}
                    </span>
                    <span>
                        <strong>End:</strong>{" "}
                        {course?.end_at ? new Date(course.end_at).toLocaleDateString() : "Ongoing"}
                    </span>
                    {course?.institution_name && (
                        <span>
                            <strong>Institution:</strong> {course.institution_name}
                        </span>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Assignments</h2>
                {assignments.length === 0 ? (
                    <p className="text-gray-500">No assignments found. Sync your account to pull the latest data.</p>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {assignments.map((a) => (
                            <li key={a.assignment_id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800">{a.assignment_name}</p>
                                    <p className="text-sm text-gray-500">
                                        Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : "No due date"}
                                    </p>
                                </div>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        a.status === "completed"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                    }`}
                                >
                                    {a.status || "pending"}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default withAuth(CoursePage);
