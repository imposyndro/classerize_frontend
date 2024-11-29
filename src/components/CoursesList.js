import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBook, FaBookOpen } from 'react-icons/fa';

export default function CoursesList({ userId }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get('/api/courses', { params: { userId } })
            .then(response => {
                setCourses(response.data);
            })
            .catch(error => {
                console.error('Error fetching courses:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userId]);

    if (loading) {
        return <div className="text-gray-500 text-center mt-4">Loading courses...</div>;
    }

    return (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Your Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map(course => (
                    <div key={course.courseId} className="border p-4 rounded-lg flex flex-col items-start">
                        <h3 className="font-bold text-lg">{course.courseName}</h3>
                        <p className="text-gray-600">{course.institutionName}</p>
                        {course.status === 'in-progress' ? (
                            <FaBookOpen className="text-blue-500 mb-2" />
                        ) : (
                            <FaBook className="text-green-500 mb-2" />
                        )}
                        <button className="mt-auto bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                            View Course Details
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
