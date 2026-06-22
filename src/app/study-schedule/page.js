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
            const [schedRes, urgRes] = await Promise.all([
                apiClient.get('/api/ai/study-schedule'),
                apiClient.get('/api/ai/urgency'),
            ]);
            const schedData = schedRes?.ok ? await schedRes.json() : {};
            const urgData  = urgRes?.ok  ? await urgRes.json()  : {};
            setSchedule(schedData.schedule || '');
            setUrgency(urgData.urgency || []);
        } catch (e) {
            setError('Failed to load AI recommendations. Ensure your AI API key is configured.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const riskColors = {
        high: 'bg-danger-subtle border-danger text-danger',
        medium: 'bg-warning-subtle border-warning text-warning',
        low: 'bg-success-subtle border-success text-success',
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-ink mb-6">AI Study Schedule</h1>

                {loading && (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="skeleton h-6" />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="bg-danger-subtle text-danger px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {urgency.length > 0 && (
                            <section className="mb-8">
                                <h2 className="text-lg font-semibold text-ink mb-3">At-Risk Assignments</h2>
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
                            <h2 className="text-lg font-semibold text-ink mb-3">Your Study Plan</h2>
                            <div className="card p-5 whitespace-pre-wrap text-sm text-ink-soft leading-relaxed">
                                {schedule || 'No upcoming assignments found. Enjoy your free time!'}
                            </div>
                        </section>

                        <button
                            onClick={load}
                            className="mt-6 text-sm text-brand hover:underline"
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
