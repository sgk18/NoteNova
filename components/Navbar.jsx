"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { BookOpen, Menu, X, LogOut, Moon, Sun } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const links = user
    ? [
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

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
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
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                NoteNova
              </span>
            </Link>
            <div className="hidden md:flex ml-8 space-x-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    pathname === l.href
                      ? "text-cyan-400 bg-white/10 neon-glow"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {l.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300"
              title={`Switch to ${theme === "galaxy" ? "Executive" : "Galaxy"} mode`}
            >
              {theme === "galaxy" ? (
                <>
                  <Sun className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs">Executive</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-purple-400" />
                  <span className="text-xs">Galaxy</span>
                </>
              )}
            </button>
            {user && (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            )}
          </div>
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="text-gray-300 p-2"
              title="Toggle theme"
            >
              {theme === "galaxy" ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-purple-400" />}
            </button>
            <button onClick={() => setOpen(!open)} className="text-gray-300">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/10 glass">
          <div className="px-3 py-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setOpen(false)}
              >
                {l.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-white/10 rounded-lg"
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
