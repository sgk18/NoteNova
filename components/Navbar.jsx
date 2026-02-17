"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { BookOpen, Menu, X, LogOut } from "lucide-react";
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
        { name: "Leaderboard", href: "/leaderboard" },
        { name: "Profile", href: "/profile" },
      ]
    : [
        { name: "Home", href: "/" },
        { name: "Leaderboard", href: "/leaderboard" },
        { name: "Login", href: "/login" },
        { name: "Register", href: "/register" },
      ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
              <BookOpen className="h-7 w-7" />
              NoteNova
            </Link>
            <div className="hidden md:flex ml-8 space-x-6">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm font-medium transition-colors ${pathname === l.href ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-600 hover:text-gray-900"}`}
                >
                  {l.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center">
            {user && (
              <button onClick={logout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setOpen(!open)}>
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                {l.name}
              </Link>
            ))}
            {user && (
              <button onClick={logout} className="block w-full text-left px-3 py-2 text-base font-medium text-red-500">
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
