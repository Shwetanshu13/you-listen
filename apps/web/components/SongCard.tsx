// components/SongCard.tsx
"use client";

import { Play, Pause, Heart, MoreVertical } from "lucide-react";
import { useAudioStore } from "@/stores/useAudioStore";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group flex items-center justify-between p-4 rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden",
        isCurrent
          ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/30"
          : "bg-white/5 hover:bg-white/10 backdrop-blur-sm"
      )}
    >
      {/* Background glow effect */}
      {isCurrent && (
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 animate-pulse" />
      )}

      {/* Song Info */}
      <div className="flex items-center space-x-4 relative z-10">
        {/* Play Button */}
        <button
          onClick={handlePlay}
          className={cn(
            "relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform cursor-pointer",
            isCurrent
              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
              : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white",
            isHovered && "scale-110"
          )}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}

          {/* Glowing ring for current song */}
          {isCurrent && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 animate-ping opacity-30" />
          )}
        </button>

        {/* Song Details */}
        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              "font-semibold text-lg truncate transition-colors duration-300",
              isCurrent ? "text-pink-300" : "text-white"
            )}
          >
            {title}
          </span>
          <span className="text-sm text-gray-400 truncate">
            {artist || "Unknown Artist"}
          </span>
        </div>

        {/* Playing indicator */}
        {isCurrent && isPlaying && (
          <div className="flex items-center space-x-1 ml-3">
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
          </div>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-3 relative z-10">
        {/* Duration */}
        <span className="text-sm text-gray-400 min-w-[3rem] text-right">
          {duration}
        </span>

        {/* Action buttons (show on hover) */}
        <div
          className={cn(
            "flex items-center space-x-2 transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110",
              isLiked
                ? "text-pink-500 hover:text-pink-400"
                : "text-gray-400 hover:text-white"
            )}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
          </button>

          <button
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
