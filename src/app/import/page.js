"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { withAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import apiClient from "@/lib/apiClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function ImportPage() {
    const [courses, setCourses]   = useState([]);
    const [file, setFile]         = useState(null);
    const [parsing, setParsing]   = useState(false);
    const [parsed, setParsed]     = useState(null);   // { course_name, course_code, instructor, assignments }
    const [rows, setRows]         = useState([]);      // editable assignments
    const [courseId, setCourseId] = useState("");
    const [error, setError]       = useState("");
    const [confirming, setConfirming] = useState(false);
    const [done, setDone]         = useState(null);    // { created }
    const fileRef = useRef(null);

    useEffect(() => {
        apiClient.get("/api/courses").then(async (res) => {
            if (res?.ok) setCourses((await res.json()).courses || []);
        });
    }, []);

    const parse = async () => {
        if (!file) return;
        setParsing(true); setError(""); setParsed(null); setDone(null);
        try {
            const fd = new FormData();
            fd.append("syllabus", file);
            // FormData must bypass the JSON Content-Type apiClient sets, so call fetch directly.
            const res = await fetch(`${API}/api/syllabus/parse`, { method: "POST", credentials: "include", body: fd });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to parse the PDF."); return; }
            setParsed(data);
            setRows((data.assignments || []).map((a) => ({ ...a, _include: true })));
        } catch {
            setError("Network error while uploading.");
        } finally {
            setParsing(false);
        }
    };

    const updateRow = (i, patch) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));

    const confirm = async () => {
        if (!courseId) { setError("Pick a course to import into."); return; }
        const chosen = rows.filter((r) => r._include && r.name.trim());
        if (!chosen.length) { setError("Select at least one assignment."); return; }
        setConfirming(true); setError("");
        const res = await apiClient.post("/api/syllabus/confirm", {
            course_id: Number(courseId),
            filename: file?.name,
            assignments: chosen.map(({ name, due_date, points, type }) => ({ name, due_date: due_date || null, points, type })),
        });
        setConfirming(false);
        const data = await res.json().catch(() => ({}));
        if (res?.ok) { setDone({ created: data.created }); setParsed(null); setRows([]); }
        else setError(data.error || "Import failed.");
    };

    const reset = () => { setFile(null); setParsed(null); setRows([]); setDone(null); setError(""); if (fileRef.current) fileRef.current.value = ""; };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Import Syllabus</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Upload a syllabus PDF and let AI extract the assignments, exams, and due dates. Review them, then import into a course.
                </p>

                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">{error}</div>}

                {done ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                        <div className="text-4xl mb-3">📚</div>
                        <p className="text-lg font-semibold text-gray-800 mb-1">Imported {done.created} assignment{done.created === 1 ? "" : "s"}!</p>
                        <p className="text-sm text-gray-500 mb-4">They're now on your assignments list and calendar.</p>
                        <div className="flex gap-3 justify-center">
                            <Link href="/assignments" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">View assignments</Link>
                            <button onClick={reset} className="border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Import another</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Upload */}
                        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
                            <input ref={fileRef} type="file" accept="application/pdf"
                                   onChange={(e) => setFile(e.target.files?.[0] || null)}
                                   className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100" />
                            <button onClick={parse} disabled={!file || parsing}
                                    className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                                {parsing ? "Reading syllabus…" : "✨ Extract assignments"}
                            </button>
                            {parsing && <p className="text-xs text-gray-400 mt-2">This can take a few seconds while the AI reads your PDF.</p>}
                        </div>

                        {/* Review */}
                        {parsed && (
                            <div className="bg-white rounded-xl border border-gray-100 p-5">
                                <div className="mb-4 text-sm text-gray-600">
                                    <span className="font-medium">Detected:</span>{" "}
                                    {parsed.course_name || "Unknown course"}
                                    {parsed.course_code && ` (${parsed.course_code})`}
                                    {parsed.instructor && ` · ${parsed.instructor}`}
                                </div>

                                <label className="block text-xs font-medium text-gray-600 mb-1">Import into course *</label>
                                <select value={courseId} onChange={(e) => setCourseId(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-1 focus:ring-blue-400">
                                    <option value="">Select a course…</option>
                                    {courses.map((c) => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
                                </select>

                                {rows.length === 0 ? (
                                    <p className="text-sm text-gray-400 py-4 text-center">No assignments were detected in this PDF.</p>
                                ) : (
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium px-1">
                                            <span className="w-6" />
                                            <span className="flex-1">Name</span>
                                            <span className="w-32">Due date</span>
                                            <span className="w-16">Points</span>
                                        </div>
                                        {rows.map((r, i) => (
                                            <div key={i} className={`flex items-center gap-2 ${r._include ? "" : "opacity-40"}`}>
                                                <input type="checkbox" checked={r._include}
                                                       onChange={(e) => updateRow(i, { _include: e.target.checked })}
                                                       className="w-4 h-4 accent-blue-600" />
                                                <input value={r.name} onChange={(e) => updateRow(i, { name: e.target.value })}
                                                       className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                                <input type="date" value={r.due_date || ""} onChange={(e) => updateRow(i, { due_date: e.target.value })}
                                                       className="w-32 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                                <input type="number" value={r.points ?? ""} onChange={(e) => updateRow(i, { points: e.target.value === "" ? null : Number(e.target.value) })}
                                                       className="w-16 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button onClick={confirm} disabled={confirming || rows.length === 0}
                                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                                    {confirming ? "Importing…" : `Import ${rows.filter((r) => r._include).length} assignment${rows.filter((r) => r._include).length === 1 ? "" : "s"}`}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

export default withAuth(ImportPage);
