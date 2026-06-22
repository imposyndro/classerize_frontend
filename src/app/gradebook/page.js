"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/dashboard/Navbar";
import TrendChart from "@/components/gradebook/TrendChart";
import { withAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

const COURSE_COLORS = [
    "#4F46E5", "#0EA5E9", "#10B981", "#F59E0B",
    "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6",
];

function getGradeColor(pct) {
    if (!pct) return "text-gray-400";
    if (pct >= 90) return "text-green-600";
    if (pct >= 80) return "text-blue-600";
    if (pct >= 70) return "text-yellow-600";
    return "text-red-600";
}

function ColorPicker({ current, onPick }) {
    return (
        <div className="flex gap-1.5 mt-2">
            {COURSE_COLORS.map((c) => (
                <button
                    key={c}
                    onClick={() => onPick(c)}
                    className="w-5 h-5 rounded-full border-2 transition"
                    style={{
                        backgroundColor: c,
                        borderColor: current === c ? "white" : "transparent",
                        boxShadow: current === c ? `0 0 0 2px ${c}` : "none",
                    }}
                    title={c}
                />
            ))}
            <button
                onClick={() => onPick(null)}
                className="w-5 h-5 rounded-full border border-gray-300 bg-white text-gray-400 text-xs leading-none flex items-center justify-center"
                title="Clear color"
            >×</button>
        </div>
    );
}

function GradeRow({ row, courseColors, onColorChange }) {
    const [expanded, setExpanded]   = useState(false);
    const [trend, setTrend]         = useState(null);
    const [loadingTrend, setLoadingTrend] = useState(false);
    const [pickingColor, setPickingColor] = useState(false);
    const [whatIfOpen, setWhatIfOpen] = useState(false);
    const [whatIf, setWhatIf]         = useState(null);
    const [whatIfScenarios, setWhatIfScenarios] = useState([]);
    const [loadingWhatIf, setLoadingWhatIf] = useState(false);

    const color = courseColors[row.course_id] || row.color || "#6B7280";

    const toggleExpand = async () => {
        if (!expanded && !trend) {
            setLoadingTrend(true);
            const res = await apiClient.get(`/api/grades/trend/${row.course_id}`);
            if (res?.ok) {
                const data = await res.json();
                setTrend(data.trend || []);
            }
            setLoadingTrend(false);
        }
        setExpanded(!expanded);
    };

    const openWhatIf = async () => {
        setWhatIfOpen(true);
        if (whatIf) return;
        setLoadingWhatIf(true);
        const res = await apiClient.post("/api/grades/whatif", { courseId: row.course_id, scenarios: [] });
        if (res?.ok) {
            const data = await res.json();
            setWhatIf(data);
            setWhatIfScenarios(
                (data.remainingAssignments || []).map((a) => ({ assignmentId: a.assignment_id, hypotheticalScore: "", name: a.assignment_name, pts: a.points_possible }))
            );
        }
        setLoadingWhatIf(false);
    };

    const runScenario = async () => {
        const scenarios = whatIfScenarios
            .filter((s) => s.hypotheticalScore !== "")
            .map((s) => ({ assignmentId: s.assignmentId, hypotheticalScore: Number(s.hypotheticalScore) }));
        setLoadingWhatIf(true);
        const res = await apiClient.post("/api/grades/whatif", { courseId: row.course_id, scenarios });
        if (res?.ok) {
            const data = await res.json();
            setWhatIf(data);
        }
        setLoadingWhatIf(false);
    };

    const handleColorPick = async (c) => {
        await apiClient.patch(`/api/courses/${row.course_id}/color`, { color: c });
        onColorChange(row.course_id, c);
        setPickingColor(false);
    };

    return (
        <div className="border-b border-gray-100 last:border-0">
            {/* Main row */}
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer" onClick={toggleExpand}>
                {/* Color swatch */}
                <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: color, minWidth: 4 }} />

                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{row.course_name}</p>
                    <p className="text-xs text-gray-400">{row.course_code}{row.institution_name ? ` · ${row.institution_name}` : ""}</p>
                </div>

                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{row.lms_name}</span>

                <div className="text-right shrink-0">
                    <span className={`font-bold text-xl ${getGradeColor(row.grade_percent)}`}>
                        {row.letter_grade || "—"}
                    </span>
                    {row.grade_percent && (
                        <p className="text-xs text-gray-400">{Number(row.grade_percent).toFixed(1)}%</p>
                    )}
                </div>

                <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Expanded panel */}
            {expanded && (
                <div className="px-6 pb-4 bg-gray-50 border-t border-gray-100">
                    {/* Action buttons */}
                    <div className="flex gap-3 pt-3 mb-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); setPickingColor(!pickingColor); }}
                            className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg bg-white"
                        >
                            Set color
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); openWhatIf(); }}
                            className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg bg-white"
                        >
                            What-If Calculator
                        </button>
                    </div>

                    {/* Color picker */}
                    {pickingColor && (
                        <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                            <ColorPicker current={color} onPick={handleColorPick} />
                        </div>
                    )}

                    {/* What-If panel */}
                    {whatIfOpen && (
                        <div className="mb-4 bg-white rounded-lg border border-blue-100 p-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-gray-700">What-If Calculator</p>
                                <button onClick={() => setWhatIfOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
                            </div>
                            {loadingWhatIf ? (
                                <p className="text-xs text-gray-400">Calculating…</p>
                            ) : whatIf ? (
                                <>
                                    <div className="flex gap-6 text-sm mb-3">
                                        <div>
                                            <p className="text-xs text-gray-400">Projected grade</p>
                                            <p className={`text-2xl font-bold ${getGradeColor(whatIf.projectedGrade)}`}>
                                                {whatIf.projectedGrade !== null ? `${Number(whatIf.projectedGrade).toFixed(1)}%` : "—"}
                                            </p>
                                        </div>
                                        {whatIf.neededForA !== null && (
                                            <div>
                                                <p className="text-xs text-gray-400">Need for A (≥90%)</p>
                                                <p className="text-sm font-semibold text-green-600">{Number(whatIf.neededForA).toFixed(0)}% avg</p>
                                            </div>
                                        )}
                                        {whatIf.neededForB !== null && (
                                            <div>
                                                <p className="text-xs text-gray-400">Need for B (≥80%)</p>
                                                <p className="text-sm font-semibold text-blue-600">{Number(whatIf.neededForB).toFixed(0)}% avg</p>
                                            </div>
                                        )}
                                    </div>

                                    {whatIfScenarios.length > 0 && (
                                        <>
                                            <p className="text-xs text-gray-500 mb-2">Enter hypothetical scores for upcoming assignments:</p>
                                            <div className="space-y-1.5">
                                                {whatIfScenarios.map((s, i) => (
                                                    <div key={s.assignmentId} className="flex items-center gap-2">
                                                        <p className="text-xs text-gray-600 flex-1 truncate">{s.name}</p>
                                                        <input
                                                            type="number" min="0" max={s.pts} step="1"
                                                            placeholder={`/ ${s.pts}`}
                                                            value={s.hypotheticalScore}
                                                            onChange={(e) => {
                                                                const copy = [...whatIfScenarios];
                                                                copy[i] = { ...s, hypotheticalScore: e.target.value };
                                                                setWhatIfScenarios(copy);
                                                            }}
                                                            className="w-20 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={runScenario}
                                                    className="mt-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition">
                                                Recalculate
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : null}
                        </div>
                    )}

                    {/* Grade trend chart */}
                    <p className="text-xs font-medium text-gray-500 mb-1">Grade trend</p>
                    {loadingTrend ? (
                        <div className="h-24 bg-gray-100 rounded animate-pulse" />
                    ) : (
                        <TrendChart
                            color={color}
                            points={(trend || []).map((t) => ({
                                label: t.assignment_name,
                                value: t.grade_percent,
                                date:  t.graded_at,
                            }))}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function GradebookPage() {
    const [summary, setSummary]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [courseColors, setCourseColors] = useState({});

    useEffect(() => {
        apiClient.get("/api/grades/summary").then(async (res) => {
            if (res?.ok) {
                const data = await res.json();
                setSummary(data.summary || []);
                // Seed local color state from API
                const colorMap = {};
                (data.summary || []).forEach((r) => { if (r.color) colorMap[r.course_id] = r.color; });
                setCourseColors(colorMap);
            }
        }).finally(() => setLoading(false));
    }, []);

    const handleColorChange = (courseId, color) => {
        setCourseColors((prev) => ({ ...prev, [courseId]: color }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Gradebook</h1>

                {loading ? (
                    <div className="space-y-3">
                        {[1,2,3].map(i => (
                            <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/4" />
                            </div>
                        ))}
                    </div>
                ) : summary.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        No grade data yet. Sync your accounts from the dashboard to pull grades.
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {summary.map((row) => (
                            <GradeRow
                                key={row.course_id}
                                row={row}
                                courseColors={courseColors}
                                onColorChange={handleColorChange}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default withAuth(GradebookPage);
