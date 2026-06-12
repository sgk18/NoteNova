"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Menu, X, LogOut, ChevronDown, Star } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import NotificationBell from "@/components/NotificationBell";
import { useSocket } from "@/hooks/useSocket";
import toast from "react-hot-toast";
import { BellRing } from "lucide-react";

const THEMES = [
  { value: "ion", label: "Dark", icon: "◐" },
  { value: "galaxy", label: "Violet", icon: "◉" },
  { value: "white", label: "Light", icon: "○" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const exploreRef = useRef(null);

  const currentTheme = THEMES.find((t) => t.value === theme) || THEMES[0];
  const isWhite = theme === "white";

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, [pathname]);

  const { isConnected, joinRoom, onEscalation } = useSocket();

  useEffect(() => {
    if (isConnected && user?.department) {
      joinRoom(user.department);
      onEscalation((data) => {
        // Don't notify the person who escalated
        if (data.user?.id !== user.id) {
          toast((t) => (
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500 p-2 rounded-lg text-white">
                <BellRing className="h-4 w-4" />
              </div>
              <div className="flex-grow">
                <p className="text-xs font-bold">New Escalation: {data.department}</p>
                <p className="text-[10px] text-neutral-500 line-clamp-1">{data.question}</p>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    router.push("/ask-nova");
                  }}
                  className="mt-1 text-[10px] font-bold text-cyan-500 hover:underline"
                >
                  Help Now
                </button>
              </div>
            </div>
          ), { duration: 6000 });
        }
      });
    }
  }, [isConnected, user, joinRoom, onEscalation, router]);

  useEffect(() => {
    const handleClick = (e) => {
      const inDesktop = desktopDropdownRef.current?.contains(e.target);
      const inMobile = mobileDropdownRef.current?.contains(e.target);
      const inExplore = exploreRef.current?.contains(e.target);
      if (!inDesktop && !inMobile) setThemeOpen(false);
      if (!inExplore) setExploreOpen(false);
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

  // Primary links shown directly in the navbar
  const primaryLinks = user
    ? [
      { name: "Home", href: "/" },
      { name: "Dashboard", href: "/dashboard" },
      { name: "Upload", href: "/upload" },
      { name: "Ask Nova", href: "/ask-nova" },
      { name: "Profile", href: "/profile" },
      ...(user.role === "admin" ? [{ name: "Admin", href: "/admin" }] : []),
    ]
    : [
      { name: "Home", href: "/" },
      { name: "Ask Nova", href: "/ask-nova" },
      { name: "Leaderboard", href: "/leaderboard" },
    ];

  // Explore dropdown items (auth only)
  const exploreLinks = [
    { name: "Bounties", href: "/bounty-board" },
    { name: "Mock Exam", href: "/mock-exam" },
    { name: "Leaderboard", href: "/leaderboard" },
  ];

  // All links for mobile menu
  const allMobileLinks = user
    ? [
      { name: "Home", href: "/" },
      { name: "Dashboard", href: "/dashboard" },
      { name: "Upload", href: "/upload" },
      { name: "Ask Nova", href: "/ask-nova" },
      { name: "Bounties", href: "/bounty-board" },
      { name: "Mock Exam", href: "/mock-exam" },
      { name: "Leaderboard", href: "/leaderboard" },
      { name: "Profile", href: "/profile" },
      ...(user.role === "admin" ? [{ name: "Admin", href: "/admin" }] : []),
    ]
    : [
      { name: "Home", href: "/" },
      { name: "Ask Nova", href: "/ask-nova" },
      { name: "Leaderboard", href: "/leaderboard" },
      { name: "Login", href: "/login" },
      { name: "Register", href: "/register" },
    ];

  // Unauthenticated action buttons
  const authButtons = !user
    ? [
      { name: "Login", href: "/login" },
      { name: "Register", href: "/register" },
    ]
    : [];

  const isExploreActive = exploreLinks.some((l) => pathname === l.href);

  const linkClass = (href, name) => {
    if (name === "Login" || name === "Register") {
      return isWhite
        ? "bg-neutral-900 text-white hover:bg-neutral-800 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
        : "btn-gradient text-white neon-glow px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300";
    }
    return `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${pathname === href
      ? isWhite
        ? "text-blue-600 bg-blue-50 font-semibold"
        : "text-cyan-400 bg-white/10 neon-glow"
      : isWhite
        ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        : "text-gray-300 hover:text-white hover:bg-white/5"
      }`;
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isWhite
      ? "bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"
      : "glass-strong border-b border-white/10"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Logo + Links */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8">
                <Image
                  src="/logo.png"
                  alt="NoteNova Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className={`text-xl font-bold ${isWhite
                ? "text-gray-900"
                : "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                }`}>
                NoteNova
              </span>
            </Link>
            <div className="hidden md:flex ml-8 gap-2 items-center">
              {primaryLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={linkClass(l.href, l.name)}
                >
                  {l.name}
                </Link>
              ))}

              {/* Explore Dropdown (auth only) */}
              {user && (
                <div ref={exploreRef} className="relative">
                  <button
                    onClick={() => setExploreOpen(!exploreOpen)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isExploreActive
                      ? isWhite
                        ? "text-blue-600 bg-blue-50 font-semibold"
                        : "text-cyan-400 bg-white/10 neon-glow"
                      : isWhite
                        ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    Explore
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${exploreOpen ? "rotate-180" : ""}`} />
                  </button>
                  {exploreOpen && (
                    <div className={`absolute left-0 mt-2 w-48 rounded-xl overflow-hidden shadow-xl z-50 border ${isWhite
                      ? "bg-white border-gray-200"
                      : "bg-slate-900 border-white/10"
                      }`}>
                      {exploreLinks.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setExploreOpen(false)}
                          className={`block w-full text-left px-4 py-3 text-sm transition-all ${pathname === l.href
                            ? isWhite
                              ? "bg-blue-50 text-blue-600 font-semibold"
                              : "bg-white/10 text-cyan-400 font-semibold"
                            : isWhite
                              ? "text-gray-700 hover:bg-gray-50"
                              : "text-gray-300 hover:bg-white/5"
                            }`}
                        >
                          {l.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Auth buttons for unauthenticated */}
              {authButtons.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={linkClass(l.href, l.name)}
                >
                  {l.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-2">
            <div ref={desktopDropdownRef} className="relative">
              <button
                onClick={() => setThemeOpen(!themeOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isWhite
                  ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
                  : "text-gray-300 hover:text-white hover:bg-white/5 border border-white/10"
                  }`}
              >
                <span className="text-xs">{currentTheme.icon}</span>
                <span className="text-xs">{currentTheme.label}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${themeOpen ? "rotate-180" : ""}`} />
              </button>
              {themeOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-xl overflow-hidden shadow-xl z-50 border ${isWhite
                  ? "bg-white border-gray-200"
                  : "bg-slate-900 border-white/10"
                  }`}>
                  {THEMES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setTheme(t.value); setThemeOpen(false); }}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-all ${theme === t.value
                        ? isWhite
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "bg-white/10 text-cyan-400 font-semibold"
                        : isWhite
                          ? "text-gray-700 hover:bg-gray-50"
                          : "text-gray-300 hover:bg-white/5"
                        }`}
                    >
                      <span className="text-xs">{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nova Points Badge */}
            {user && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isWhite
                ? "bg-amber-50 text-amber-600 border border-amber-200"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{user.points ?? 0}</span>
                <span className="hidden lg:inline">Nova Points</span>
              </div>
            )}

            {user && <NotificationBell />}
            {user && (
              <button
                onClick={logout}
                className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors ${isWhite
                  ? "text-gray-500 hover:text-red-500 hover:bg-red-50"
                  : "text-gray-400 hover:text-red-400 hover:bg-white/5"
                  }`}
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            {/* Nova Points Badge (mobile) */}
            {user && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold ${isWhite
                ? "bg-amber-50 text-amber-600 border border-amber-200"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                <Star className="h-3 w-3 fill-current" />
                <span>{user.points ?? 0}</span>
              </div>
            )}
            {user && <NotificationBell />}
            <div ref={mobileDropdownRef} className="relative">
              <button
                onClick={() => setThemeOpen(!themeOpen)}
                className={`p-2 rounded-md text-sm ${isWhite ? "text-neutral-500" : "text-neutral-400"}`}
              >
                {currentTheme.icon}
              </button>
              {themeOpen && (
                <div className={`absolute right-0 mt-2 w-44 rounded-xl overflow-hidden shadow-xl z-50 border ${isWhite
                  ? "bg-white border-gray-200"
                  : "bg-slate-900 border-white/10"
                  }`}>
                  {THEMES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setTheme(t.value); setThemeOpen(false); }}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-all ${theme === t.value
                        ? isWhite
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "bg-white/10 text-cyan-400 font-semibold"
                        : isWhite
                          ? "text-gray-700 hover:bg-gray-50"
                          : "text-gray-300 hover:bg-white/5"
                        }`}
                    >
                      <span className="text-xs">{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className={isWhite ? "text-neutral-600" : "text-neutral-400"}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={`md:hidden border-t ${isWhite ? "border-gray-200 bg-white" : "border-white/10 glass"
          }`}>
          <div className="px-3 py-3 space-y-1">
            {allMobileLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${l.name === "Login" || l.name === "Register"
                  ? isWhite ? "bg-neutral-900 text-white mt-1" : "btn-gradient text-white mt-1"
                  : pathname === l.href
                    ? isWhite ? "text-blue-600 bg-blue-50 font-semibold" : "text-cyan-400 bg-white/10 font-semibold"
                    : isWhite
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
                className={`block w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg ${isWhite
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
