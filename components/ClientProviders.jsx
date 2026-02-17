"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
<<<<<<< HEAD
=======
import Footer from "@/components/Footer";
>>>>>>> cf9160f45eb9d649a0e81ad486ed92ef3ef08b9a

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
<<<<<<< HEAD
=======
      <Footer />
>>>>>>> cf9160f45eb9d649a0e81ad486ed92ef3ef08b9a
    </ThemeProvider>
  );
}
