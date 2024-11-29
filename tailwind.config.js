// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5', // Blueish shade for LMS feel
        secondary: '#10b981', // Green for actions like buttons
        neutral: '#f3f4f6', // Light gray for backgrounds
        accent: '#f59e0b', // Orange for highlights
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        light: '#f8fafc', // A lighter background for contrast
      },
      boxShadow: {
        card: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        button: '0 2px 10px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        large: '1.5rem',
      },
      spacing: {
        18: '4.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      transitionDuration: {
        300: '300ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Helps style forms cleanly and consistently
    require('@tailwindcss/typography'), // Improves readability of text-heavy pages
  ],
};
