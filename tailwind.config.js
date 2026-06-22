// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Dark mode driven by CSS variables; the selector lets a future theme
  // toggle force dark via <html data-theme="dark"> and still use dark: variants.
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand (indigo)
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          fg: "var(--brand-fg)",
          subtle: "var(--brand-subtle)",
        },
        // Surfaces
        app: "var(--bg-app)",
        surface: "var(--bg-surface)",
        subtle: "var(--bg-subtle)",
        // Text
        ink: {
          DEFAULT: "var(--text-primary)",
          soft: "var(--text-secondary)",
          faint: "var(--text-tertiary)",
        },
        // Hairlines (usable as border-line / border-line-strong)
        line: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        // Semantic
        success: { DEFAULT: "var(--success)", subtle: "var(--success-subtle)" },
        warning: { DEFAULT: "var(--warning)", subtle: "var(--warning-subtle)" },
        danger: { DEFAULT: "var(--danger)", subtle: "var(--danger-subtle)" },
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        soft: "var(--shadow-soft)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      borderRadius: {
        card: "var(--radius-lg)",
        tile: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      spacing: {
        18: "4.5rem",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: {
        "out-soft": "var(--ease-out)",
        spring: "var(--ease-spring)",
      },
      transitionDuration: {
        fast: "140ms",
        base: "220ms",
        slow: "360ms",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "none" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fadeUp var(--dur-slow) var(--ease-out) both",
        "fade-in": "fadeIn var(--dur-base) var(--ease-out) both",
        "pop-in": "popIn var(--dur-base) var(--ease-spring) both",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
