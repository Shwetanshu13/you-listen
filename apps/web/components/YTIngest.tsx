"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";

export default function YouTubeIngestForm() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl || !title || !artist) {
      toast.error("All fields are required");
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post("/songs/ingest", {
        youtubeUrl,
        title,
        artist,
      });
      toast.success("Upload queued successfully");
      setYoutubeUrl("");
      setTitle("");
      setArtist("");
      router.refresh();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Ingest failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">YT</span>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">
            YouTube Song Ingest
          </h2>
          <p className="text-gray-400">Import songs directly from YouTube</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              YouTube URL
            </label>
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Song Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter song title"
                className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Artist Name
              </label>
              <input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Enter artist name"
                className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Import from YouTube</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
