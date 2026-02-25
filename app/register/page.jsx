"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

export default function RegisterPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isWhite = theme === "white";
  const [form, setForm] = useState({ name: "", email: "", password: "", college: "", department: "", semester: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.college) return toast.error("Fill all required fields");
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

  const inputClass = `w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none ${
    isWhite
      ? "bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400"
      : "bg-[var(--input-bg)] border border-[var(--glass-border)] text-white placeholder-neutral-500 focus:border-neutral-500"
  }`;

  const selectClass = `${inputClass} appearance-none`;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className={`w-full max-w-sm rounded-lg p-6 sm:p-8 ${isWhite ? "bg-white border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"}`}>
        <div className="text-center mb-6">
          <h2 className={`text-xl font-bold ${isWhite ? "text-neutral-900" : "text-white"}`}>Join NoteNova</h2>
          <p className={`text-xs mt-1 ${isWhite ? "text-neutral-400" : "text-neutral-500"}`}>Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="name" placeholder="Full Name *" required className={inputClass} value={form.name} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email *" required className={inputClass} value={form.email} onChange={handleChange} />
          <input name="password" type="password" placeholder="Password *" required className={inputClass} value={form.password} onChange={handleChange} />
          <input name="college" placeholder="College / Institution *" required className={inputClass} value={form.college} onChange={handleChange} />
          <select name="department" className={selectClass} value={form.department} onChange={handleChange}>
            <option value="" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>Select Department</option>
            {["CSE","IT","ECE","EEE","MECH","CIVIL","AIDS","AIML","CSE (Cyber Security)","Biomedical","Chemical","Automobile"].map(d => <option key={d} value={d} className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>{d}</option>)}
          </select>
          <select name="semester" className={selectClass} value={form.semester} onChange={handleChange}>
            <option value="" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>Select Semester</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>Semester {s}</option>)}
          </select>
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg btn-gradient text-white text-sm font-medium disabled:opacity-50">
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p className={`text-center text-xs mt-5 ${isWhite ? "text-neutral-400" : "text-neutral-500"}`}>
          Already have an account?{" "}
          <Link href="/login" className={`font-medium ${isWhite ? "text-neutral-900" : "text-white"} hover:underline`}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
