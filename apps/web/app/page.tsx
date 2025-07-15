// app/(main)/page.tsx
"use client";
import SongList from "@/components/SongList";

export default function HomePage() {
  return (
    <div className="min-h-screen pb-24">
      {/* reserve space for audio player */}
      <h1 className="text-2xl font-bold p-6 text-white">All Songs</h1>
      <SongList />
    </div>
  );
}
