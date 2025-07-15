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
      // Toggle play/pause if already selected
      setIsPlaying(!isPlaying);
    } else {
      // Set new song and auto-play
      setCurrentSong({ id, title, artist, duration, fileUrl });
      setIsPlaying(true);
    }
  };

  return (
    <div
      className={cn(
        "flex justify-between items-center p-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition cursor-pointer",
        isCurrent && "bg-pink-600"
      )}
      onClick={handlePlay}
    >
      <div>
        <p className="text-white font-semibold">{title}</p>
        <p className="text-sm text-gray-400">{artist || "Unknown Artist"}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-300">{duration || "0:00"}</span>
        {isCurrent && isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </div>
    </div>
  );
}
