"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Pause,
  Play,
  Volume2,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  Heart,
} from "lucide-react";
import { useAudioStore, RepeatMode } from "@/stores/useAudioStore";
import { cn } from "@/lib/utils";
import axios from "@/utils/axios";

const togglePlayPause = () => {
  const { isPlaying, setIsPlaying, currentSong } = useAudioStore.getState();
  if (!currentSong) return;
  setIsPlaying(!isPlaying);
};

export default function AudioPlayer() {
  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    playNext,
    playPrevious,
    shuffle,
    toggleShuffle,
    repeat,
    setRepeat,
    volume: storeVolume,
    setVolume: setStoreVolume,
    queue,
  } = useAudioStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(storeVolume / 100);
  const [isLiked, setIsLiked] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // Sync volume with store
  useEffect(() => {
    setVolume(storeVolume / 100);
  }, [storeVolume]);

  const checkLikeStatus = useCallback(async () => {
    if (!currentSong?.id) return;

    try {
      const response = await axios.get(`/likes/status/${currentSong.id}`);
      setIsLiked(response.data.liked);
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  }, [currentSong?.id]);

  // Check if current song is liked
  useEffect(() => {
    if (currentSong?.id) {
      checkLikeStatus();
    }
  }, [currentSong?.id, checkLikeStatus]);

  const handleLikeToggle = async () => {
    if (!currentSong?.id) return;

    try {
      const response = await axios.post("/likes/toggle", {
        songId: currentSong.id,
      });
      setIsLiked(response.data.liked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
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

    const handleEnded = () => {
      // Track play history
      if (currentSong?.id) {
        axios
          .post("/history", {
            songId: currentSong.id,
            playedDuration: Math.floor(audio.currentTime),
          })
          .catch(console.error);
      }

      // Auto-play next song
      playNext();
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentSong, playNext]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setStoreVolume(Math.round(volume * 100));
    }
  }, [volume, setStoreVolume]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isTyping =
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        active?.getAttribute("contenteditable") === "true";

      if (isTyping) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowRight":
          e.preventDefault();
          playNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          playPrevious();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playNext, playPrevious]);

  const handleRepeatToggle = () => {
    const modes: RepeatMode[] = ["off", "all", "one"];
    const currentIndex = modes.indexOf(repeat);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeat(modes[nextIndex]);
  };

  const getRepeatIcon = () => {
    switch (repeat) {
      case "one":
        return <Repeat1 className="w-5 h-5" />;
      case "all":
        return <Repeat className="w-5 h-5" />;
      default:
        return <Repeat className="w-5 h-5" />;
    }
  };

  if (!currentSong) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 glass text-white border-t border-white/10 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10" />
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 max-w-7xl mx-auto w-full p-4">
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
            <button
              onClick={handleLikeToggle}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110",
                isLiked ? "text-pink-500" : "text-gray-400 hover:text-white"
              )}
            >
              <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-3 w-full lg:max-w-2xl">
            {/* Control Buttons */}
            <div className="flex items-center gap-4">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110",
                  shuffle ? "text-pink-500" : "text-gray-400 hover:text-white"
                )}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Previous */}
              <button
                onClick={playPrevious}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
                title="Previous"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Play/Pause */}
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

              {/* Next */}
              <button
                onClick={playNext}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
                title="Next"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Repeat */}
              <button
                onClick={handleRepeatToggle}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110",
                  repeat !== "off"
                    ? "text-pink-500"
                    : "text-gray-400 hover:text-white"
                )}
                title={`Repeat: ${repeat}`}
              >
                {getRepeatIcon()}
              </button>
            </div>

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

          {/* Volume Control & Queue */}
          <div className="flex items-center gap-4 min-w-0 flex-1 justify-end">
            <button
              onClick={() => setShowQueue(!showQueue)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
              title="Queue"
            >
              <ListMusic className="w-5 h-5" />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-xs flex items-center justify-center">
                  {queue.length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <div className="relative w-20">
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
        </div>

        <audio ref={audioRef} src={currentSong.fileUrl} preload="metadata" />
      </div>

      {/* Queue Panel */}
      {showQueue && (
        <div className="fixed bottom-24 right-4 w-80 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 p-4 z-40 max-h-96 overflow-y-auto">
          <h3 className="text-white font-semibold mb-3">
            Queue ({queue.length} songs)
          </h3>
          {queue.length > 0 ? (
            <div className="space-y-2">
              {queue.map((song, index) => (
                <div
                  key={`${song.id}-${index}`}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-colors duration-200",
                    song.id === currentSong?.id
                      ? "bg-pink-500/20"
                      : "hover:bg-white/10"
                  )}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded flex items-center justify-center text-xs font-bold">
                    {song.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {song.artist}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No songs in queue</p>
          )}
        </div>
      )}
    </>
  );
}
