// app/(main)/page.tsx
"use client";
import SongList from "@/components/SongList";
import { Music, Sparkles, Headphones } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
        <div className="relative glass rounded-3xl p-8 md:p-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center animate-float">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center animate-float"
                style={{ animationDelay: "2s" }}
              >
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-pink-600 flex items-center justify-center animate-float"
                style={{ animationDelay: "4s" }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Welcome to You Listen
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Your personal music streaming sanctuary. Discover, stream, and
                enjoy your favorite tracks in pristine quality.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Streaming in HD Quality</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>Unlimited Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Music Library Section */}
      <SongList />
    </div>
  );
}
