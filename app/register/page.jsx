"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", department: "", semester: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("Fill required fields");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Registered! Please login.");
        router.push("/login");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[120px]" />
      <div className="w-full max-w-md glass-strong rounded-2xl p-8 neon-border relative">
        <div className="text-center mb-8">
          <Sparkles className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white">Join NoteNova</h2>
          <p className="text-sm text-gray-400 mt-1">Start your knowledge journey</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Full Name *" required className="w-full px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none focus:neon-glow" value={form.name} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email *" required className="w-full px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none focus:neon-glow" value={form.email} onChange={handleChange} />
          <input name="password" type="password" placeholder="Password *" required className="w-full px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none focus:neon-glow" value={form.password} onChange={handleChange} />
          <input name="department" placeholder="Department" className="w-full px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none focus:neon-glow" value={form.department} onChange={handleChange} />
          <select name="semester" className="w-full px-4 py-3 rounded-xl glass neon-border text-white text-sm focus:outline-none focus:neon-glow bg-transparent appearance-none" value={form.semester} onChange={handleChange}>
            <option value="" className="bg-slate-900">Select Semester</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-slate-900">Semester {s}</option>)}
          </select>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl btn-gradient text-white font-semibold text-sm disabled:opacity-50">
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
