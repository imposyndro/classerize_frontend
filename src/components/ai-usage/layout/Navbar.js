"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBarChart2 } from "react-icons/fi";
import ThemeToggle from "@/components/ai-usage/ThemeToggle";

const LINKS = [
  { href: "/ai-usage", label: "Dashboard" },
  { href: "/ai-usage/compare", label: "Compare" },
  { href: "/ai-usage/insights", label: "Insights" },
  { href: "/ai-usage/import", label: "Import" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/ai-usage" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
            <FiBarChart2 size={18} />
          </span>
          <span className="font-heading text-lg font-semibold">
            AI Usage<span className="text-brand-500">Tracker</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 sm:flex">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-brand-500/10 text-brand-600 dark:text-brand-300"
                      : "text-content-muted hover:bg-surface-muted hover:text-content"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile links */}
      <div className="flex gap-1 overflow-x-auto border-t border-surface-border px-3 py-2 sm:hidden">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                active ? "bg-brand-500/10 text-brand-600 dark:text-brand-300" : "text-content-muted"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
