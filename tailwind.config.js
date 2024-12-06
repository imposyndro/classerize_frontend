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
        primary: '#1a73e8', // Softer blue for readability
        secondary: '#34a853', // Softer green
        neutral: '#ffffff', // Lighter neutral for readability
        accent: '#fbbc05', // Softer accent color for highlights
        background: '#f5f5f5', // Light gray for overall background
        foreground: '#202124', // Dark gray for text foreground
        light: '#f1f3f4',
        textPrimary: '#333333', // Darker text color for high contrast
        textSecondary: '#666666', // Lighter text color for subtitles
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
      textColor: {
        primary: '#333333',
        secondary: '#666666',
        accent: '#fbbc05',
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
