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
    <div className="fixed bottom-0 left-0 right-0 glass text-white border-t border-white/10 z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10" />
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 max-w-7xl mx-auto w-full p-4">
        {/* Song Info */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-white">
              {currentSong.title.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold truncate text-white">
              {currentSong.title}
            </p>
            <p className="text-sm text-gray-400 truncate">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-3 w-full md:max-w-2xl">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="relative w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 animate-ping opacity-30" />
          </button>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-xs text-gray-400 min-w-[3rem] text-right">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
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
                className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs text-gray-400 min-w-[3rem]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
          <Volume2 className="w-5 h-5 text-gray-400" />
          <div className="relative w-24">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-150"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={currentSong.fileUrl} preload="metadata" />
    </div>
  );
}
