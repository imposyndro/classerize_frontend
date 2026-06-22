"use client";

import Navbar from "@/components/dashboard/Navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FiGrid, FiCheckSquare, FiBarChart2, FiLayers,
    FiCalendar, FiUpload, FiBell, FiSettings,
} from "react-icons/fi";

const NAV_LINKS = [
    { href: "/dashboard",       label: "Dashboard",      icon: FiGrid },
    { href: "/assignments",     label: "Assignments",    icon: FiCheckSquare },
    { href: "/gradebook",       label: "Gradebook",      icon: FiBarChart2 },
    { href: "/flashcards",      label: "Flashcards",     icon: FiLayers },
    { href: "/study-schedule",  label: "Study Schedule", icon: FiCalendar },
    { href: "/import",          label: "Import Syllabus", icon: FiUpload },
    { href: "/notifications",   label: "Notifications",   icon: FiBell },
    { href: "/settings",        label: "Settings",        icon: FiSettings },
];

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    return (
        <div className="min-h-screen bg-app flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="hidden md:flex flex-col w-56 bg-surface border-r border-line pt-6 px-3 shrink-0">
                    <nav className="space-y-1">
                        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                            const active = pathname === href || pathname?.startsWith(href + "/");
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-base ${
                                        active
                                            ? "bg-brand-subtle text-brand"
                                            : "text-ink-soft hover:bg-subtle hover:text-ink"
                                    }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>
                <main key={pathname} className="flex-1 p-6 animate-fade-in">{children}</main>
            </div>
        </div>
    );
}
