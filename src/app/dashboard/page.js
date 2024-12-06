"use client";

import React, { useEffect, useState } from 'react';
import { addCourse } from '@/services/unifiedAPI';

const DashboardPage = () => {
    const [lms, setLms] = useState('canvas'); // Default to Canvas
    const [newCourseName, setNewCourseName] = useState('');
    const [newCourseDescription, setNewCourseDescription] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleAddCourse = async () => {
        if (!newCourseName.trim()) {
            alert('Course name cannot be empty!');
            return;
        }
        try {
            setLoading(true);
            const courseDetails = { name: newCourseName, description: newCourseDescription };
            const response = await addCourse({ lms, courseDetails });
            setCourses((prevCourses) => [...prevCourses, response]);
            setNewCourseName('');
            setNewCourseDescription('');
            alert('Course added successfully!');
        } catch (error) {
            console.error('Failed to add course:', error);
            alert('An error occurred while adding the course.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-heading mb-6 text-center">LMS Dashboard</h1>

            {/* Add Course Form */}
            <div className="mb-6 w-full md:w-2/3">
                <h2 className="text-xl font-bold mb-4">Add a New Course</h2>
                <div className="flex flex-col gap-4">
                    <select
                        className="border border-gray-300 p-2 rounded-md"
                        value={lms}
                        onChange={(e) => setLms(e.target.value)}
                    >
                        <option value="canvas">Canvas</option>
                        <option value="moodle">Moodle</option>
                        <option value="google_classroom">Google Classroom</option>
                        {/* Add more LMS options here */}
                    </select>
                    <input
                        type="text"
                        className="border border-gray-300 p-2 rounded-md"
                        placeholder="Course Name"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                    />
                    <textarea
                        className="border border-gray-300 p-2 rounded-md"
                        placeholder="Course Description"
                        value={newCourseDescription}
                        onChange={(e) => setNewCourseDescription(e.target.value)}
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        onClick={handleAddCourse}
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Course'}
                    </button>
                </div>
            </div>

            {/* Courses List */}
            <div className="mb-4 w-full md:w-2/3">
                <h2 className="text-xl font-bold mb-2">Your Courses</h2>
                <ul className="list-disc pl-6">
                    {courses.map((course, index) => (
                        <li key={index}>
                            {course.name || 'Untitled Course'} ({course.lms})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DashboardPage;
