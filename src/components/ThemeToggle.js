"use client";

import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

/**
 * Light/dark toggle. Persists an explicit choice to localStorage and reflects it
 * on <html data-theme>. With no stored choice the app follows the OS preference
 * (handled in globals.css), and an inline script in the root layout applies the
 * stored value before paint to avoid a flash.
 */
export default function ThemeToggle() {
    const [dark, setDark] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const explicit = document.documentElement.dataset.theme;
        const isDark = explicit
            ? explicit === "dark"
            : window.matchMedia("(prefers-color-scheme: dark)").matches;
        setDark(isDark);
        setReady(true);
    }, []);

    const toggle = () => {
        const next = dark ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem("theme", next); } catch {}
        setDark(!dark);
    };

    return (
        <button
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Light mode" : "Dark mode"}
            className="text-ink-soft hover:text-ink transition-colors p-1.5 rounded-lg hover:bg-subtle"
        >
            {/* Avoid an icon flash before we know the theme */}
            {ready && (dark ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />)}
        </button>
    );
}
