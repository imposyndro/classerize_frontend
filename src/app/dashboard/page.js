"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout'; // Adjust path if needed

const DashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const validateSession = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:5000/api/auth/dashboard', // Replace with your validation endpoint
                    { withCredentials: true } // Include credentials
                );
                if (response.status === 200) {
                    setLoading(false); // Session is valid, stop loading
                } else {
                    throw new Error('Invalid session');
                }
            } catch (error) {
                console.error('Session validation failed:', error.response?.data || error.message);
                router.push('/login'); // Redirect to login if validation fails
            }
        };

        validateSession();
    }, [router]);

    if (loading) return <p>Loading...</p>;

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-heading mb-6">Welcome to your Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Example Course Cards */}
                <div className="bg-neutral p-4 rounded-lg shadow-card">
                    <h2 className="text-xl font-bold text-primary">Course 1</h2>
                    <p className="text-secondary">Description for course 1</p>
                </div>
                <div className="bg-neutral p-4 rounded-lg shadow-card">
                    <h2 className="text-xl font-bold text-primary">Course 2</h2>
                    <p className="text-secondary">Description for course 2</p>
                </div>
                {/* Add more cards as needed */}
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
