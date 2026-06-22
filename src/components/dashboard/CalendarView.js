"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import apiClient from "@/lib/apiClient";

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    getDay,
    locales: { "en-US": enUS },
});

const FALLBACK_COLORS = {
    assignment:      "#3B82F6",
    class:           "#10B981",
    custom:          "#8B5CF6",
    google_calendar: "#EA4335",
};

function WorkloadBar({ week_start, heaviness, assignment_count, pending_count }) {
    const date = new Date(week_start);
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const color = heaviness >= 75 ? "#EF4444" : heaviness >= 40 ? "#F59E0B" : "#10B981";
    return (
        <div className="flex flex-col items-center gap-0.5" title={`${assignment_count} assignments (${pending_count} pending)`}>
            <div className="w-8 bg-gray-100 rounded-full overflow-hidden" style={{ height: 40 }}>
                <div className="w-full rounded-full transition-all" style={{ height: `${heaviness}%`, backgroundColor: color, marginTop: `${100 - heaviness}%` }} />
            </div>
            <span className="text-xs text-gray-400 text-center leading-tight">{label}</span>
            <span className="text-xs font-semibold" style={{ color }}>{assignment_count}</span>
        </div>
    );
}

export default function CalendarView() {
    const [events, setEvents]     = useState([]);
    const [workload, setWorkload] = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [evtRes, wkRes] = await Promise.all([
                    apiClient.get("/api/calendar/events"),
                    apiClient.get("/api/calendar/workload?weeks=8"),
                ]);

                if (evtRes?.ok) {
                    const data = await evtRes.json();
                    const mapped = (data.events || []).map((e) => ({
                        id:       e.event_id,
                        title:    e.event_name,
                        start:    new Date(e.event_date),
                        end:      e.end_time ? new Date(e.end_time) : new Date(new Date(e.event_date).getTime() + 3600000),
                        resource: e,
                        color:    e.color || FALLBACK_COLORS[e.event_type] || FALLBACK_COLORS.custom,
                    }));
                    setEvents(mapped);
                }

                if (wkRes?.ok) {
                    const data = await wkRes.json();
                    setWorkload(data.workload || []);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const eventStyleGetter = (event) => ({
        style: {
            backgroundColor: event.color,
            borderRadius: "4px",
            border: "none",
            color: "#fff",
            fontSize: "0.75rem",
            padding: "2px 4px",
        },
    });

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center">
                <p className="text-gray-400">Loading calendar…</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Calendar</h2>
                <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/calendar/export.ics`}
                    className="text-xs text-blue-500 hover:underline"
                    target="_blank" rel="noreferrer"
                >
                    Export .ics
                </a>
            </div>

            {/* Workload heatmap */}
            {workload.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Upcoming workload</p>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                        {workload.map((w) => (
                            <WorkloadBar key={w.week_start} {...w} />
                        ))}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Light</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Moderate</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Heavy</span>
                    </div>
                </div>
            )}

            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                eventPropGetter={eventStyleGetter}
                views={["month", "week", "agenda"]}
                defaultView="month"
            />
        </div>
    );
}
