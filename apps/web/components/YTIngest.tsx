"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

export default function YouTubeIngestForm() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const router = useRouter();

  const ytIngestMutation = trpc.songs.ytIngestSong.useMutation({
    onSuccess: () => {
      toast.success("Upload queued successfully");
      setYoutubeUrl("");
      setTitle("");
      setArtist("");
      router.refresh();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl || !title || !artist) {
      toast.error("All fields are required");
      return;
    }

    ytIngestMutation.mutate({ youtubeUrl, title, artist });
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
          disabled={ytIngestMutation.isPending}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded"
        >
          {ytIngestMutation.isPending ? "Submitting..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
