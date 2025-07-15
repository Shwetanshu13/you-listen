// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import AudioPlayerWrapper from "@/components/AudioPlayerWrapper";
import Navbar from "@/components/Navbar";

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
        <Providers>
          <Navbar />

          {/* 👇 Add top + bottom padding to account for fixed Navbar & Player */}
          <main className="pt-16 pb-24 px-4 max-w-5xl min-h-screen mx-auto">
            {children}
          </main>
        </Providers>
        <AudioPlayerWrapper />
      </body>
    </html>
  );
}
