"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

const links = [
  { name: "Home", href: "/" },
  { name: "Upload", href: "/upload" },
  { name: "Ask Nova", href: "/ask-nova" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Dashboard", href: "/dashboard" },
];

export default function Footer() {
  const { theme } = useTheme();
  const isWhite = theme === "white";

  return (
    <footer className={`mt-auto border-t ${isWhite ? "border-neutral-200 bg-white" : "border-[var(--glass-border)] bg-[var(--bg-secondary)]"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Brand */}
          <div>
            <p className={`text-sm font-semibold ${isWhite ? "text-neutral-900" : "text-white"}`}>NoteNova</p>
            <p className={`text-xs mt-1 ${isWhite ? "text-neutral-400" : "text-neutral-500"}`}>
              Collaborative academic platform powered by AI.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((l) => (
              <Link
                key={l.name}
                href={l.href}
                className={`text-sm transition-colors ${
                  isWhite ? "text-neutral-500 hover:text-neutral-900" : "text-neutral-500 hover:text-white"
                }`}
              >
                {l.name}
              </Link>
            ))}
          </div>
        </div>

        <div className={`mt-6 pt-6 border-t text-xs ${isWhite ? "border-neutral-100 text-neutral-400" : "border-[var(--glass-border)] text-neutral-600"}`}>
          © 2026 NoteNova. Built for collaborative learning.
        </div>
      </div>
    </footer>
  );
}

