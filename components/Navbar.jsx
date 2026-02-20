"use client";

import Link from "next/link";
<<<<<<< HEAD
import Image from "next/image";
<<<<<<< HEAD
import { useState, useEffect } from "react";
<<<<<<< HEAD
import { BookOpen, Menu, X, LogOut } from "lucide-react";
=======
import { useState, useEffect } from "react";
import { BookOpen, Menu, X, LogOut, Sparkles } from "lucide-react";
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
=======
import { BookOpen, Menu, X, LogOut, Moon, Sun } from "lucide-react";
>>>>>>> cf9160f45eb9d649a0e81ad486ed92ef3ef08b9a
=======
import { useState, useEffect, useRef } from "react";
import { BookOpen, Menu, X, LogOut, ChevronDown, Zap, Sparkles, Sun } from "lucide-react";
>>>>>>> 9ae88875f5bb33d36a4ee8d66ea51a25b67a474f
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

const THEMES = [
  { value: "ion", label: "Ion Drift", icon: "💼", desc: "Professional dark" },
  { value: "galaxy", label: "Galaxy", icon: "🌌", desc: "Cosmic neon" },
  { value: "white", label: "White", icon: "🤍", desc: "Clean minimal" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  const currentTheme = THEMES.find((t) => t.value === theme) || THEMES[0];

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      const inDesktop = desktopDropdownRef.current && desktopDropdownRef.current.contains(e.target);
      const inMobile = mobileDropdownRef.current && mobileDropdownRef.current.contains(e.target);
      if (!inDesktop && !inMobile) {
        setThemeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const links = user
    ? [
<<<<<<< HEAD
<<<<<<< HEAD
      { name: "Home", href: "/" },
      { name: "Dashboard", href: "/dashboard" },
      { name: "Upload", href: "/upload" },
      { name: "Ask AI", href: "/ask-ai" },
      { name: "Leaderboard", href: "/leaderboard" },
      { name: "Profile", href: "/profile" },
    ]
    : [
      { name: "Home", href: "/" },
      { name: "Ask AI", href: "/ask-ai" },
      { name: "Leaderboard", href: "/leaderboard" },
      { name: "Login", href: "/login" },
      { name: "Register", href: "/register" },
    ];
=======
        { name: "Home", href: "/" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Upload", href: "/upload" },
        { name: "Ask AI", href: "/ask-ai" },
        { name: "Leaderboard", href: "/leaderboard" },
        { name: "Profile", href: "/profile" },
      ]
    : [
=======
        { name: "Home", href: "/" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Upload", href: "/upload" },
        { name: "Ask AI", href: "/ask-ai" },
        { name: "Leaderboard", href: "/leaderboard" },
        { name: "Profile", href: "/profile" },
      ]
    : [
>>>>>>> cf9160f45eb9d649a0e81ad486ed92ef3ef08b9a
        { name: "Home", href: "/" },
        { name: "Ask AI", href: "/ask-ai" },
        { name: "Leaderboard", href: "/leaderboard" },
        { name: "Login", href: "/login" },
        { name: "Register", href: "/register" },
      ];
<<<<<<< HEAD
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
=======
>>>>>>> cf9160f45eb9d649a0e81ad486ed92ef3ef08b9a

  const isWhite = theme === "white";

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isWhite
        ? "bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"
        : "glass-strong border-b border-white/10"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Logo + Links */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
<<<<<<< HEAD
              <div className="relative w-8 h-8">
<<<<<<< HEAD
                <Image
                  src="/logo.png"
                  alt="NoteNova Logo"
                  fill
                  className="object-contain"
                />
=======
              <div className="relative">
                <Sparkles className="h-7 w-7 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <div className="absolute inset-0 bg-cyan-400/20 blur-lg rounded-full group-hover:bg-cyan-300/30 transition-colors" />
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
=======
                <Image src="/logo.png" alt="NoteNova Logo" fill className="object-contain" />
>>>>>>> 9ae88875f5bb33d36a4ee8d66ea51a25b67a474f
              </div>
              <span className={`text-xl font-bold ${
                isWhite
                  ? "text-gray-900"
                  : "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
              }`}>
                NoteNova
              </span>
            </Link>
            <div className="hidden md:flex ml-8 space-x-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
<<<<<<< HEAD
<<<<<<< HEAD
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname === l.href
                    ? "text-cyan-400 bg-white/10 neon-glow"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
=======
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
=======
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
>>>>>>> cf9160f45eb9d649a0e81ad486ed92ef3ef08b9a
                    pathname === l.href
                      ? isWhite
                        ? "text-blue-600 bg-blue-50 font-semibold"
                        : "text-cyan-400 bg-white/10 neon-glow"
                      : isWhite
                        ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
<<<<<<< HEAD
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
=======
>>>>>>> cf9160f45eb9d649a0e81ad486ed92ef3ef08b9a
                >
                  {l.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Theme Dropdown + Logout */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Dropdown */}
            <div ref={desktopDropdownRef} className="relative">
              <button
                onClick={() => setThemeOpen(!themeOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isWhite
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
                    : "text-gray-300 hover:text-white hover:bg-white/5 border border-white/10"
                }`}
              >
                <span>{currentTheme.icon}</span>
                <span className="text-xs">{currentTheme.label}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${themeOpen ? "rotate-180" : ""}`} />
              </button>
              {themeOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-xl overflow-hidden shadow-xl z-50 border ${
                  isWhite
                    ? "bg-white border-gray-200"
                    : "bg-slate-900 border-white/10"
                }`}>
                  {THEMES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setTheme(t.value); setThemeOpen(false); }}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-all ${
                        theme === t.value
                          ? isWhite
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "bg-white/10 text-cyan-400 font-semibold"
                          : isWhite
                            ? "text-gray-700 hover:bg-gray-50"
                            : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      <span className="text-base">{t.icon}</span>
                      <div>
                        <p className="font-medium">{t.label}</p>
                        <p className={`text-xs ${isWhite ? "text-gray-400" : "text-gray-500"}`}>{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {user && (
              <button
                onClick={logout}
                className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors ${
                  isWhite
                    ? "text-gray-500 hover:text-red-500 hover:bg-red-50"
                    : "text-gray-400 hover:text-red-400 hover:bg-white/5"
                }`}
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            )}
          </div>

          {/* Mobile: Theme + Hamburger */}
          <div className="md:hidden flex items-center gap-1">
            {/* Mobile theme selector */}
            <div ref={mobileDropdownRef} className="relative">
              <button
                onClick={() => setThemeOpen(!themeOpen)}
                className={`p-2 rounded-lg ${isWhite ? "text-gray-600" : "text-gray-300"}`}
              >
                <span className="text-lg">{currentTheme.icon}</span>
              </button>
              {themeOpen && (
                <div className={`absolute right-0 mt-2 w-44 rounded-xl overflow-hidden shadow-xl z-50 border ${
                  isWhite
                    ? "bg-white border-gray-200"
                    : "bg-slate-900 border-white/10"
                }`}>
                  {THEMES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setTheme(t.value); setThemeOpen(false); }}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-all ${
                        theme === t.value
                          ? isWhite
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "bg-white/10 text-cyan-400 font-semibold"
                          : isWhite
                            ? "text-gray-700 hover:bg-gray-50"
                            : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className={isWhite ? "text-gray-600" : "text-gray-300"}>
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={`md:hidden border-t ${
          isWhite ? "border-gray-200 bg-white" : "border-white/10 glass"
        }`}>
          <div className="px-3 py-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isWhite
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {l.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={logout}
                className={`block w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg ${
                  isWhite
                    ? "text-red-500 hover:bg-red-50"
                    : "text-red-400 hover:bg-white/10"
                }`}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
