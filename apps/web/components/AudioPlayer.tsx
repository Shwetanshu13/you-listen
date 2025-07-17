"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { useAudioStore } from "@/stores/useAudioStore";

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
  const [volume, setVolume] = useState(1);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 text-white px-4 py-3 shadow-md z-50">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 max-w-7xl mx-auto w-full">
        {/* Song Info */}
        <div className="text-center md:text-left">
          <p className="text-base md:text-lg font-semibold truncate max-w-[200px] sm:max-w-none">
            {currentSong.title}
          </p>
          <p className="text-sm text-gray-400 truncate max-w-[200px] sm:max-w-none">
            {currentSong.artist}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:max-w-2xl justify-center">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-neutral-700 rounded-full hover:bg-neutral-600 transition"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full">
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
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
          <Volume2 size={20} />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32 sm:w-24 accent-pink-500"
          />
        </div>
      </div>

      <audio ref={audioRef} src={currentSong.fileUrl} preload="metadata" />
    </div>
  );
}
