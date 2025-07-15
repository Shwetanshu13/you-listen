"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { useAudioStore } from "@/stores/useAudioStore";

// 🔁 Access Zustand live state safely outside render
const togglePlayPause = () => {
  const { isPlaying, setIsPlaying, currentSong } = useAudioStore.getState();
  if (!currentSong) return;
  setIsPlaying(!isPlaying);
};

export default function AudioPlayer() {
  const { currentSong, isPlaying, setIsPlaying } = useAudioStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1); // 0 to 1

  // Format seconds to mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // Sync play/pause with Zustand
  useEffect(() => {
    if (!audioRef.current) return;

    const playAudio = async () => {
      try {
        if (isPlaying) {
          await audioRef.current?.play();
        } else {
          audioRef.current?.pause();
        }
      } catch (err) {
        console.warn("Audio playback failed:", err);
      }
    };

    playAudio();
  }, [isPlaying, currentSong]);

  // Metadata + timeupdate listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", updateProgress);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, [currentSong]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Spacebar toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const active = document.activeElement;
        const isTyping =
          active?.tagName === "INPUT" ||
          active?.tagName === "TEXTAREA" ||
          active?.getAttribute("contenteditable") === "true";

        if (!isTyping) {
          e.preventDefault();
          togglePlayPause();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 text-white px-6 py-3 flex items-center justify-between shadow-md z-50">
      {/* Song Info */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-lg font-semibold">{currentSong.title}</p>
          <p className="text-sm text-gray-400">{currentSong.artist}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 w-full max-w-2xl justify-center">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 bg-neutral-700 rounded-full hover:bg-neutral-600 transition"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <div className="flex items-center gap-2 w-80">
          <span className="text-xs w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => {
              if (audioRef.current && duration) {
                const newTime = (+e.target.value / 100) * duration;
                audioRef.current.currentTime = newTime;
              }
            }}
            className="w-full h-1 cursor-pointer accent-pink-500"
          />
          <span className="text-xs w-10">{formatTime(duration)}</span>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 ml-4">
          <Volume2 size={20} />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 accent-pink-500"
          />
        </div>
      </div>

      <audio ref={audioRef} src={currentSong.fileUrl} preload="metadata" />
    </div>
  );
}
