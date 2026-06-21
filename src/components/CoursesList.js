"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

export default function CoursesList() {
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                // Courses are fetched per-account from the dashboard.
                // This component uses the linked-accounts aggregated view.
                const res = await apiClient.get("/api/linked-accounts");
                if (!res?.ok) return;
                const accounts = await res.json();
                const allCourses = [];
                for (const acct of accounts) {
                    const cr = await apiClient.get(`/api/linked-accounts/accounts/${acct.account_id}/courses`);
                    if (cr?.ok) {
                        const { courses: c } = await cr.json();
                        c.forEach((course) => allCourses.push({ ...course, lms_name: acct.lms_name, account_title: acct.title || acct.lms_name }));
                    }
                }
                setCourses(allCourses);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <p className="text-gray-400 text-sm">Loading courses...</p>;
    if (!courses.length) return <p className="text-gray-500 text-sm">No courses found.</p>;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {courses.map((c) => (
                <div key={c.id} className="bg-white rounded-lg shadow p-4">
                    <p className="font-semibold text-gray-800">{c.name}</p>
                    {c.course_code && <p className="text-xs text-gray-400">{c.course_code}</p>}
                    <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{c.lms_name}</span>
                    <button
                        onClick={() => router.push(`/course/${c.id}`)}
                        className="mt-3 text-xs text-blue-600 hover:underline block"
                    >
                        View details →
                    </button>
                </div>
            ))}
        </div>
    );
}
