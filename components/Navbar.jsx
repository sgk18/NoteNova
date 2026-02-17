"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { BookOpen, Menu, X, LogOut, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

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
    <nav className="sticky top-0 z-50 bg-[#0B1F3A]/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Sparkles className="h-7 w-7 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <div className="absolute inset-0 bg-cyan-400/20 blur-lg rounded-full group-hover:bg-cyan-300/30 transition-colors" />
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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
          <div className="hidden md:flex items-center">
            {user && (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            )}
          </div>
          <div className="md:hidden flex items-center">
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
