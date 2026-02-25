"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isWhite = theme === "white";
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Fill all fields");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Welcome back!");
        router.push("/dashboard");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none ${
    isWhite
      ? "bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400"
      : "bg-[var(--input-bg)] border border-[var(--glass-border)] text-white placeholder-neutral-500 focus:border-neutral-500"
  }`;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className={`w-full max-w-sm rounded-lg p-6 sm:p-8 ${isWhite ? "bg-white border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"}`}>
        <div className="text-center mb-6">
          <h2 className={`text-xl font-bold ${isWhite ? "text-neutral-900" : "text-white"}`}>Welcome Back</h2>
          <p className={`text-xs mt-1 ${isWhite ? "text-neutral-400" : "text-neutral-500"}`}>Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="email" type="email" placeholder="Email" required className={inputClass} value={form.email} onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" required className={inputClass} value={form.password} onChange={handleChange} />
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg btn-gradient text-white text-sm font-medium disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className={`text-center text-xs mt-5 ${isWhite ? "text-neutral-400" : "text-neutral-500"}`}>
          Don&apos;t have an account?{" "}
          <Link href="/register" className={`font-medium ${isWhite ? "text-neutral-900" : "text-white"} hover:underline`}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
