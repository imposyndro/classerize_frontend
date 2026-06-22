"use client";

import { forwardRef } from "react";

/**
 * Reusable button with full state coverage: default, hover, focus (global ring),
 * active (press), disabled, and loading (spinner). Variants + sizes keep CTAs
 * consistent across the app.
 */
const VARIANTS = {
    primary:   "bg-brand text-brand-fg hover:bg-brand-hover",
    secondary: "border border-line bg-surface text-ink-soft hover:bg-subtle hover:text-ink",
    ghost:     "text-ink-soft hover:bg-subtle hover:text-ink",
    danger:    "bg-danger text-white hover:opacity-90",
};

const SIZES = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-5 py-3",
};

const Button = forwardRef(function Button(
    { variant = "primary", size = "md", loading = false, disabled = false, className = "", children, ...props },
    ref
) {
    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,transform,opacity] duration-fast active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
            {...props}
        >
            {loading && (
                <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden="true" />
            )}
            {children}
        </button>
    );
});

export default Button;
