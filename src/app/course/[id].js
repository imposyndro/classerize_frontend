"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CoursePage() {
    const router = useRouter();
    const { id, name, course_code, start_at, end_at } = router.query;
    const [courseDetails, setCourseDetails] = useState(null);

    useEffect(() => {
        // Fetch additional course details if needed using `id`
        if (!id) return;

        const fetchCourseDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) throw new Error("Failed to fetch course details");
                const data = await response.json();
                setCourseDetails(data);
            } catch (error) {
                console.error("Error fetching course details:", error.message);
            }
        };

        fetchCourseDetails();
    }, [id]);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold">{name || "Course Details"}</h1>
            <p>Course Code: {course_code || "N/A"}</p>
            <p>Start Date: {start_at ? new Date(start_at).toLocaleString() : "N/A"}</p>
            <p>End Date: {end_at ? new Date(end_at).toLocaleString() : "N/A"}</p>

            {courseDetails && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold">More Details:</h2>
                    <pre>{JSON.stringify(courseDetails, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
