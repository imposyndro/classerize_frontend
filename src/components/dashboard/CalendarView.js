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

const EVENT_COLORS = {
    assignment:    "#3B82F6",
    class:         "#10B981",
    custom:        "#8B5CF6",
    google_calendar: "#EA4335",
};

export default function CalendarView() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await apiClient.get("/api/calendar/events");
                if (res?.ok) {
                    const data = await res.json();
                    const mapped = (data.events || []).map((e) => ({
                        id: e.event_id,
                        title: e.event_name,
                        start: new Date(e.event_date),
                        end: new Date(new Date(e.event_date).getTime() + 60 * 60 * 1000),
                        resource: e,
                        color: EVENT_COLORS[e.event_type] || EVENT_COLORS.custom,
                    }));
                    setEvents(mapped);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
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
                <p className="text-gray-400">Loading calendar...</p>
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
