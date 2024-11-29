import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';

export default function AssignmentsList({ userId }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        axios.get('/api/assignments', { params: { userId } })
            .then(response => {
                setAssignments(response.data);
            })
            .catch(error => {
                console.error('Error fetching assignments:', error);
                setError('Failed to load assignments. Please try again later.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userId]);

    if (loading) {
        return <div className="text-gray-500 text-center mt-4">Loading assignments...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-4">{error}</div>;
    }

    return (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Your Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assignments.map(assignment => (
                    <div key={assignment.assignmentId} className="border p-4 rounded-lg flex flex-col items-start">
                        <h3 className="font-bold text-lg">{assignment.assignmentName}</h3>
                        <p className="text-gray-600 mb-2">Due: {assignment.dueDate}</p>
                        {assignment.status === 'completed' ? (
                            <FaCheckCircle className="text-green-500 mb-2" />
                        ) : (
                            <FaHourglassHalf className="text-yellow-500 mb-2" />
                        )}
                        <button
                            className="mt-auto bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                            onClick={() => markAsComplete(assignment.assignmentId)}
                        >
                            Mark as Complete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    function markAsComplete(assignmentId) {
        // Example function to mark an assignment as complete
        axios.put(`/api/assignments/${assignmentId}`, { status: 'completed' })
            .then(() => {
                setAssignments(prev =>
                    prev.map(a => a.assignmentId === assignmentId ? { ...a, status: 'completed' } : a)
                );
            })
            .catch(error => {
                console.error('Error marking assignment as complete:', error);
            });
    }
}
