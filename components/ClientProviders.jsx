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
            background: "#1e293b",
            color: "#e2e8f0",
            border: "1px solid #334155",
            fontSize: "13px",
          },
        }}
      />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </ThemeProvider>
  );
}
