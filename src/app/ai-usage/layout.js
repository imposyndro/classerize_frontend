// Layout for the AI Usage Tracker section. Renders the tracker's own sub-nav and
// applies the tracker's surface theming scoped to /ai-usage/* (via `ai-usage-scope`)
// so the LMS pages keep their own styling. Theme context (light/dark) is provided
// globally by the root layout's ThemeProvider.
import Navbar from "@/components/ai-usage/layout/Navbar";

export default function AiUsageLayout({ children }) {
  return (
    <div className="ai-usage-scope min-h-screen bg-surface-muted font-sans text-content antialiased">
      <Navbar />
      {children}
    </div>
  );
}
