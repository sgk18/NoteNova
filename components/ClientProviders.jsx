"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientProviders({ children }) {
  return (
    <ThemeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.9)",
            color: "#e2e8f0",
            border: "1px solid var(--border-accent)",
            backdropFilter: "blur(12px)",
          },
        }}
      />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </ThemeProvider>
  );
}
