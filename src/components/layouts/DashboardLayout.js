"use client";

import Navbar from "@/components/dashboard/Navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
    { href: "/dashboard",       label: "Dashboard" },
    { href: "/assignments",     label: "Assignments" },
    { href: "/gradebook",       label: "Gradebook" },
    { href: "/study-schedule",  label: "Study Schedule" },
    { href: "/notifications",   label: "Notifications" },
    { href: "/settings",        label: "Settings" },
];

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="hidden md:flex flex-col w-52 bg-white border-r border-gray-200 pt-6 px-3 shrink-0">
                    <nav className="space-y-1">
                        {NAV_LINKS.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                                    pathname === href || pathname?.startsWith(href + "/")
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
