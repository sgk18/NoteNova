import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "NoteNova — Campus Resource Sharing",
  description: "Share, access, and collaborate on academic resources. Powered by knowledge, fueled by collaboration.",
<<<<<<< HEAD
  icons: {
    icon: '/logo.png',
  },
=======
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(15, 23, 42, 0.9)",
              color: "#e2e8f0",
              border: "1px solid rgba(124, 58, 237, 0.3)",
              backdropFilter: "blur(12px)",
            },
          }}
        />
        <Navbar />
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
