import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "NoteNova — Campus Resource Sharing",
  description: "Share, access, and collaborate on academic resources.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50 antialiased">
        <Toaster position="top-right" />
        <Navbar />
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
