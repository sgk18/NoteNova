import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="galaxy min-h-screen flex flex-col antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
