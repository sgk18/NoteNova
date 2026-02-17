"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, Github, Linkedin, Twitter } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const productLinks = [
  { name: "Home", href: "/" },
  { name: "Ask AI", href: "/ask-ai" },
  { name: "Upload", href: "/upload" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Dashboard", href: "/dashboard" },
];

const resourceLinks = [
  { name: "Smart Notes", href: "/ask-ai" },
  { name: "AI Quiz", href: "/ask-ai" },
  { name: "Study Lists", href: "/" },
  { name: "Documentation", href: "/" },
  { name: "Help Center", href: "/" },
];

const companyLinks = [
  { name: "About", href: "/" },
  { name: "Privacy Policy", href: "/" },
  { name: "Terms of Service", href: "/" },
  { name: "Contact", href: "/" },
];

export default function Footer() {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const isGalaxy = theme === "galaxy";

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const linkClass = isGalaxy
    ? "text-slate-400 hover:text-cyan-400 transition-all duration-300"
    : "text-slate-500 hover:text-blue-400 hover:underline transition-all duration-300";

  const headingClass = isGalaxy
    ? "text-white font-semibold text-sm mb-4"
    : "text-slate-300 font-semibold text-sm mb-4";

  return (
    <footer
      className={`relative mt-auto transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {/* Animated top border — Galaxy only */}
      {isGalaxy && (
        <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-shimmer" />
      )}
      {!isGalaxy && <div className="h-px w-full bg-slate-700/50" />}

      <div
        className={`relative overflow-hidden ${
          isGalaxy
            ? "bg-gradient-to-b from-[#0d1b3e]/90 to-[#1a1147]/90 backdrop-blur-xl"
            : "bg-slate-900"
        }`}
      >
        {/* Floating stars — Galaxy only */}
        {isGalaxy && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white/20 animate-nova-pulse"
                style={{
                  top: `${15 + (i * 37) % 70}%`,
                  left: `${5 + (i * 23) % 90}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className={`h-5 w-5 ${isGalaxy ? "text-cyan-400" : "text-blue-400"}`} />
                <span className={`text-lg font-bold ${isGalaxy ? "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent" : "text-white"}`}>
                  NoteNova
                </span>
              </div>
              <p className={`text-sm font-medium mb-2 ${isGalaxy ? "text-slate-300" : "text-slate-400"}`}>
                Turn your notes into impact.
              </p>
              <p className={`text-xs leading-relaxed ${isGalaxy ? "text-slate-500" : "text-slate-600"}`}>
                Collaborative academic platform powered by AI.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className={headingClass}>Product</h4>
              <ul className="space-y-2.5">
                {productLinks.map((l) => (
                  <li key={l.name}>
                    <Link href={l.href} className={`text-sm ${linkClass}`}>{l.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className={headingClass}>Resources</h4>
              <ul className="space-y-2.5">
                {resourceLinks.map((l) => (
                  <li key={l.name}>
                    <Link href={l.href} className={`text-sm ${linkClass}`}>{l.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className={headingClass}>Company</h4>
              <ul className="space-y-2.5">
                {companyLinks.map((l) => (
                  <li key={l.name}>
                    <Link href={l.href} className={`text-sm ${linkClass}`}>{l.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t ${isGalaxy ? "border-purple-500/20" : "border-slate-700/50"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className={`text-xs ${isGalaxy ? "text-slate-500" : "text-slate-600"}`}>
              © 2026 NoteNova. Built for collaborative learning.
            </p>
            <div className="flex items-center gap-4">
              {[
                { Icon: Github, href: "#", label: "GitHub" },
                { Icon: Linkedin, href: "#", label: "LinkedIn" },
                { Icon: Twitter, href: "#", label: "Twitter" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isGalaxy
                      ? "text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10 hover:shadow-[0_0_12px_rgba(0,212,255,0.2)]"
                      : "text-slate-500 hover:text-blue-400 hover:bg-blue-400/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
