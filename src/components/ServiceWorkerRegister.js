"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for PWA / offline support.
 * Rendered once in the root layout. No-op where service workers are unsupported.
 */
export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
        const register = () => {
            navigator.serviceWorker.register("/sw.js").catch(() => {
                // Registration failures are non-fatal — the app still works online.
            });
        };
        // Wait until the page has loaded so we don't compete with initial render.
        if (document.readyState === "complete") register();
        else window.addEventListener("load", register, { once: true });
    }, []);

    return null;
}
