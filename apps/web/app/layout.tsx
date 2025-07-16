// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
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
      <body className="bg-neutral-900 text-white antialiased">
        <Toaster />
        <AuthGuard>
          <Providers>
            <Navbar />

            {/* 👇 Add top + bottom padding to account for fixed Navbar & Player */}
            <main className="pt-16 pb-24 px-4 max-w-5xl min-h-screen mx-auto">
              {children}
            </main>
          </Providers>
          <AudioPlayerWrapper />
        </AuthGuard>
      </body>
    </html>
  );
}
