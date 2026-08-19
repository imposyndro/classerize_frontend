// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a73e8', // Softer blue for readability
        secondary: '#34a853', // Softer green
        neutral: '#ffffff', // Lighter neutral for readability
        accent: '#fbbc05', // Softer accent color for highlights
        background: '#f5f5f5', // Light gray for overall background
        foreground: '#202124', // Dark gray for text foreground
        light: '#f1f3f4',
        textPrimary: '#333333', // Darker text color for high contrast
        textSecondary: '#666666', // Lighter text color for subtitles
        // --- AI Usage Tracker palette ---
        // Brand / accent ramp (modern AI-tool violet→indigo)
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        // Per-provider accent colors used across charts
        anthropic: "#d97757",
        google: "#4285f4",
        openai: "#10a37f",
        // Semantic surface tokens (work in light + dark via CSS vars)
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--surface-muted) / <alpha-value>)",
        "surface-border": "rgb(var(--surface-border) / <alpha-value>)",
        content: "rgb(var(--content) / <alpha-value>)",
        "content-muted": "rgb(var(--content-muted) / <alpha-value>)",
      },
      boxShadow: {
        card: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        button: '0 2px 10px rgba(0, 0, 0, 0.1)',
        glow: "0 0 40px -10px rgba(99, 102, 241, 0.45)",
      },
      borderRadius: {
        large: '1.5rem',
        xl2: "1.25rem",
      },
      spacing: {
        18: '4.5rem',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        heading: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
      textColor: {
        primary: '#333333',
        secondary: '#666666',
        accent: '#fbbc05',
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.15), transparent 60%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
      transitionDuration: {
        300: '300ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
