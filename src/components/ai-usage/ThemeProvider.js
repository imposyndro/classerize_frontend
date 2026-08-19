"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

// Wraps next-themes; class strategy matches tailwind.config darkMode: "class".
export default function ThemeProvider({ children }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </NextThemeProvider>
  );
}
