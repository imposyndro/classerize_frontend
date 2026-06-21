'use client';

import { useState, useEffect } from 'react';
import { withAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import apiClient from '@/lib/apiClient';

function StudySchedulePage() {
    const [schedule, setSchedule] = useState('');
    const [urgency, setUrgency] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const [sched, urg] = await Promise.all([
                apiClient.get('/api/ai/study-schedule'),
                apiClient.get('/api/ai/urgency'),
            ]);
            setSchedule(sched.schedule || '');
            setUrgency(urg.urgency || []);
        } catch (e) {
            setError('Failed to load AI recommendations. Ensure your AI API key is configured.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const riskColors = {
        high: 'bg-red-100 border-red-400 text-red-800',
        medium: 'bg-yellow-100 border-yellow-400 text-yellow-800',
        low: 'bg-green-100 border-green-400 text-green-800',
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Study Schedule</h1>

                {loading && (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {urgency.length > 0 && (
                            <section className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-800 mb-3">At-Risk Assignments</h2>
                                <div className="space-y-2">
                                    {urgency.map((item) => (
                                        <div
                                            key={item.assignment_id}
                                            className={`border-l-4 px-4 py-2 rounded-r-lg text-sm ${riskColors[item.risk_level] || riskColors.low}`}
                                        >
                                            <span className="font-semibold capitalize">[{item.risk_level}]</span>{' '}
                                            {item.reason}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Study Plan</h2>
                            <div className="bg-white border border-gray-200 rounded-xl p-5 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                                {schedule || 'No upcoming assignments found. Enjoy your free time!'}
                            </div>
                        </section>

                        <button
                            onClick={load}
                            className="mt-6 text-sm text-blue-600 hover:underline"
                        >
                            Refresh recommendations
                        </button>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

export default withAuth(StudySchedulePage);
