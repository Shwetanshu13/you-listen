// components/SongCard.tsx
"use client";

import { Play, Pause } from "lucide-react";
import { useAudioStore } from "@/stores/useAudioStore";
import { cn } from "@/lib/utils";

type SongCardProps = {
  id: number;
  title: string;
  artist: string;
  duration: string;
  fileUrl: string;
};

export default function SongCard({
  id,
  title,
  artist,
  duration,
  fileUrl,
}: SongCardProps) {
  const { currentSong, isPlaying, setCurrentSong, setIsPlaying } =
    useAudioStore();

  const isCurrent = currentSong?.id === id;

  const handlePlay = () => {
    if (isCurrent) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong({ id, title, artist, duration, fileUrl });
      setIsPlaying(true);
    }
  };

  return (
    <div
      onClick={handlePlay}
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition cursor-pointer group",
        isCurrent && "bg-pink-600 hover:bg-pink-500"
      )}
    >
      <div className="flex flex-col">
        <span className="text-white font-medium">{title}</span>
        <span className="text-sm text-gray-400">
          {artist || "Unknown Artist"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-300">{duration || "0:00"}</span>
        <button>
          {isCurrent && isPlaying ? (
            <Pause size={20} className="text-white" />
          ) : (
            <Play size={20} className="text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
