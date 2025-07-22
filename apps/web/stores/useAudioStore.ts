// stores/useAudioStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Song = {
  id: number;
  title: string;
  artist: string;
  duration: string;
  fileUrl: string;
  isLiked?: boolean;
};

export type RepeatMode = "off" | "one" | "all";

interface AudioState {
  // Current playback
  currentSong: Song | null;
  isPlaying: boolean;

  // Queue management
  queue: Song[];
  currentIndex: number;
  originalQueue: Song[]; // For shuffle mode

  // Playback modes
  shuffle: boolean;
  repeat: RepeatMode;
  autoplay: boolean;

  // Volume
  volume: number;

  // Actions
  setCurrentSong: (song: Song) => void;
  setIsPlaying: (playing: boolean) => void;
  setQueue: (songs: Song[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  setRepeat: (mode: RepeatMode) => void;
  setAutoplay: (autoplay: boolean) => void;
  setVolume: (volume: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSong: null,
      isPlaying: false,
      queue: [],
      currentIndex: 0,
      originalQueue: [],
      shuffle: false,
      repeat: "off",
      autoplay: true,
      volume: 80,

      // Actions
      setCurrentSong: (song) => {
        const state = get();
        const songIndex = state.queue.findIndex((s) => s.id === song.id);

        set({
          currentSong: song,
          isPlaying: true,
          currentIndex: songIndex >= 0 ? songIndex : 0,
        });
      },

      setIsPlaying: (playing) => set({ isPlaying: playing }),

      setQueue: (songs, startIndex = 0) => {
        const state = get();
        let newQueue = [...songs];
        let newOriginalQueue = [...songs];
        let newCurrentIndex = startIndex;

        if (state.shuffle) {
          // If shuffle is on, shuffle the new queue but keep the start song at the beginning
          const startSong = songs[startIndex];
          const otherSongs = songs.filter((_, index) => index !== startIndex);
          const shuffledOthers = shuffleArray(otherSongs);
          newQueue = [startSong, ...shuffledOthers];
          newCurrentIndex = 0;
        }

        set({
          queue: newQueue,
          originalQueue: newOriginalQueue,
          currentIndex: newCurrentIndex,
          currentSong: newQueue[newCurrentIndex] || null,
        });
      },

      playNext: () => {
        const state = get();
        const { queue, currentIndex, repeat, autoplay, currentSong } = state;

        // If no queue but there's a current song, handle single song playback
        if (queue.length === 0 && currentSong) {
          if (repeat === "one") {
            // Restart the current song
            set({ isPlaying: true });
            return;
          } else {
            // Stop playing if no repeat for single song
            set({ isPlaying: false });
            return;
          }
        }

        if (!autoplay && repeat === "off") return;

        if (repeat === "one") {
          // Repeat current song
          set({ isPlaying: true });
          return;
        }

        let nextIndex = currentIndex + 1;

        if (nextIndex >= queue.length) {
          if (repeat === "all") {
            nextIndex = 0;
          } else if (repeat === "off" && !autoplay) {
            set({ isPlaying: false });
            return;
          } else {
            // Stop playing if no repeat and reached end
            set({ isPlaying: false });
            return;
          }
        }

        const nextSong = queue[nextIndex];
        if (nextSong) {
          set({
            currentSong: nextSong,
            currentIndex: nextIndex,
            isPlaying: true,
          });
        }
      },

      playPrevious: () => {
        const state = get();
        const { queue, currentIndex, currentSong } = state;

        // If no queue but there's a current song, restart the current song
        if (queue.length === 0 && currentSong) {
          set({ isPlaying: true });
          return;
        }

        let prevIndex = currentIndex - 1;

        if (prevIndex < 0) {
          if (state.repeat === "all") {
            prevIndex = queue.length - 1;
          } else {
            prevIndex = 0;
          }
        }

        const prevSong = queue[prevIndex];
        if (prevSong) {
          set({
            currentSong: prevSong,
            currentIndex: prevIndex,
            isPlaying: true,
          });
        }
      },

      toggleShuffle: () => {
        const state = get();
        const newShuffle = !state.shuffle;

        if (newShuffle) {
          // Turn on shuffle
          const currentSong = state.currentSong;
          const otherSongs = state.originalQueue.filter(
            (song) => song.id !== currentSong?.id
          );
          const shuffledOthers = shuffleArray(otherSongs);
          const newQueue = currentSong
            ? [currentSong, ...shuffledOthers]
            : shuffledOthers;

          set({
            shuffle: newShuffle,
            queue: newQueue,
            currentIndex: 0,
          });
        } else {
          // Turn off shuffle - restore original order
          const currentSong = state.currentSong;
          const originalIndex = state.originalQueue.findIndex(
            (song) => song.id === currentSong?.id
          );

          set({
            shuffle: newShuffle,
            queue: [...state.originalQueue],
            currentIndex: originalIndex >= 0 ? originalIndex : 0,
          });
        }
      },

      setRepeat: (mode) => set({ repeat: mode }),

      setAutoplay: (autoplay) => set({ autoplay }),

      setVolume: (volume) => set({ volume }),

      addToQueue: (song) => {
        const state = get();
        const newQueue = [...state.queue, song];
        const newOriginalQueue = [...state.originalQueue, song];

        set({
          queue: newQueue,
          originalQueue: newOriginalQueue,
        });
      },

      removeFromQueue: (index) => {
        const state = get();
        const { queue, originalQueue, currentIndex } = state;

        const songToRemove = queue[index];
        const newQueue = queue.filter((_, i) => i !== index);
        const newOriginalQueue = originalQueue.filter(
          (song) => song.id !== songToRemove.id
        );

        let newCurrentIndex = currentIndex;
        if (index < currentIndex) {
          newCurrentIndex = currentIndex - 1;
        } else if (index === currentIndex) {
          // If removing current song, stay at same index (next song will play)
          newCurrentIndex = Math.min(currentIndex, newQueue.length - 1);
        }

        set({
          queue: newQueue,
          originalQueue: newOriginalQueue,
          currentIndex: newCurrentIndex,
          currentSong: newQueue[newCurrentIndex] || null,
        });
      },

      clearQueue: () =>
        set({
          queue: [],
          originalQueue: [],
          currentIndex: 0,
          currentSong: null,
          isPlaying: false,
        }),
    }),
    {
      name: "audio-store",
      partialize: (state) => ({
        shuffle: state.shuffle,
        repeat: state.repeat,
        autoplay: state.autoplay,
        volume: state.volume,
      }),
    }
  )
);
