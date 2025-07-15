// stores/useAudioStore.ts
import { create } from "zustand";

export const useAudioStore = create<{
  currentSong: {
    id: number;
    title: string;
    artist: string;
    duration: string;
    fileUrl: string;
  } | null;
  isPlaying: boolean;
  setCurrentSong: (song: {
    id: number;
    title: string;
    artist: string;
    duration: string;
    fileUrl: string;
  }) => void;
  setIsPlaying: (playing: boolean) => void;
}>((set) => ({
  currentSong: null,
  isPlaying: false,
  setCurrentSong: (song) => set({ currentSong: song, isPlaying: true }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
