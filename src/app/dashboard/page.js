"use client"; // Add this at the top

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LinkLmsAccount from '../../components/LinkLmsAccount';
import CoursesList from '../../components/CoursesList';
import AssignmentsList from '../../components/AssignmentsList';

export default function Dashboard() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-semibold mb-6">Welcome to Your Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <LinkLmsAccount />
                    <CoursesList />
                </div>
                <AssignmentsList />
            </div>
        </div>
    );
}
