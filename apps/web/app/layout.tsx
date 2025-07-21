// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import AudioPlayerWrapper from "@/components/AudioPlayerWrapper";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "You Listen",
  description: "Private music streaming platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="gradient-bg text-white antialiased min-h-screen">
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(23, 23, 23, 0.7)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "white",
            },
          }}
        />
        <AuthGuard>
          <Navbar />

          {/* Main content with proper spacing */}
          <main className="pt-24 pb-32 px-6 max-w-7xl min-h-screen mx-auto">
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-3xl -z-10" />
              {children}
            </div>
          </main>
        </AuthGuard>
        <AudioPlayerWrapper />
      </body>
    </html>
  );
}
