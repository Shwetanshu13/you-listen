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
      await axiosInstance.post("/songs/yt-ingest", {
        youtubeUrl,
        title,
        artist,
      });
      toast.success("Upload queued successfully");
      setYoutubeUrl("");
      setTitle("");
      setArtist("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Ingest failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-neutral-900 rounded-xl shadow text-white">
      <h2 className="text-xl font-semibold mb-4">YouTube Song Upload</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>YouTube URL</label>
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full p-2 bg-neutral-800 rounded"
            required
          />
        </div>
        <div>
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 bg-neutral-800 rounded"
            required
          />
        </div>
        <div>
          <label>Artist</label>
          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="w-full p-2 bg-neutral-800 rounded"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded"
        >
          {isLoading ? "Submitting..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
