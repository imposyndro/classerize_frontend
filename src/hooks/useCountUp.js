"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 up to `target` on mount / when target changes.
 * Returns the current display value, rounded to `decimals`.
 * Honours prefers-reduced-motion by snapping straight to the target.
 */
export function useCountUp(target, { duration = 800, decimals = 0 } = {}) {
    const [val, setVal] = useState(0);
    const raf = useRef(null);

    useEffect(() => {
        const end = Number(target) || 0;
        const reduce = typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) { setVal(end); return; }

        let start;
        const step = (ts) => {
            if (start === undefined) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            setVal(end * eased);
            if (p < 1) raf.current = requestAnimationFrame(step);
        };
        raf.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration]);

    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
}
