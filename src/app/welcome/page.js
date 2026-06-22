"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";
import CanvasLinker from "@/components/dashboard/CanvasLinker";

const STEPS = ["Welcome", "Link your LMS", "You're all set"];

export default function WelcomePage() {
    const { user, loading, refetch } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [linked, setLinked] = useState(false);

    // If already onboarded, skip to dashboard
    useEffect(() => {
        if (!loading && user?.onboarding_complete) router.replace("/dashboard");
    }, [user, loading, router]);

    const finish = async () => {
        await apiClient.patch("/api/users/onboarding");
        await refetch();
        router.push("/dashboard");
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Progress bar */}
                <div className="flex">
                    {STEPS.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 transition-all ${i <= step ? "bg-blue-600" : "bg-gray-100"}`} />
                    ))}
                </div>

                <div className="p-8">
                    {/* Step indicators */}
                    <div className="flex items-center gap-2 mb-6">
                        {STEPS.map((s, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                                    i < step  ? "bg-blue-600 text-white" :
                                    i === step ? "bg-blue-100 text-blue-600 ring-2 ring-blue-600" :
                                                 "bg-gray-100 text-gray-400"
                                }`}>
                                    {i < step ? "✓" : i + 1}
                                </div>
                                {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-200" />}
                            </div>
                        ))}
                    </div>

                    {/* Step 0: Welcome */}
                    {step === 0 && (
                        <div>
                            <div className="text-4xl mb-4">🎓</div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                Welcome to Classerize{user?.username ? `, ${user.username}` : ""}!
                            </h1>
                            <p className="text-gray-500 mb-6">
                                Classerize connects all your LMS accounts — Canvas, Blackboard, Moodle, and more —
                                into one unified dashboard. See all your assignments, grades, and deadlines in one place.
                            </p>
                            <div className="grid grid-cols-3 gap-3 mb-8">
                                {[
                                    { icon: "📚", label: "All assignments in one place" },
                                    { icon: "📊", label: "Grade tracking & trends" },
                                    { icon: "🤖", label: "AI-powered summaries" },
                                ].map((f) => (
                                    <div key={f.label} className="bg-blue-50 rounded-xl p-3 text-center">
                                        <div className="text-2xl mb-1">{f.icon}</div>
                                        <p className="text-xs text-blue-700 font-medium">{f.label}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setStep(1)}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                                Get started →
                            </button>
                        </div>
                    )}

                    {/* Step 1: Link LMS */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-1">Connect your first LMS</h2>
                            <p className="text-gray-500 text-sm mb-5">
                                Link your Canvas account to pull in your courses, assignments, and grades automatically.
                                You can add more accounts later in Settings.
                            </p>
                            <CanvasLinker onLinkSuccess={() => setLinked(true)} compact />
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setStep(2)}
                                    className="text-sm text-gray-400 hover:text-gray-600 underline"
                                >
                                    Skip for now
                                </button>
                                {linked && (
                                    <button
                                        onClick={() => setStep(2)}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                                    >
                                        Continue →
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Done */}
                    {step === 2 && (
                        <div className="text-center">
                            <div className="text-5xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">You're all set!</h2>
                            <p className="text-gray-500 mb-2">
                                Your dashboard is ready.
                                {linked ? " Your LMS is syncing now — check back in a moment." : " Add an LMS account from the dashboard whenever you're ready."}
                            </p>
                            <p className="text-sm text-gray-400 mb-8">
                                Tip: press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">⌘K</kbd> anywhere to search your assignments.
                            </p>
                            <button onClick={finish}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                                Go to my dashboard →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
