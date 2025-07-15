"use client";

import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

export default function AdminUploadForm() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) return toast.error("Title and file are required");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      if (artist) formData.append("artist", artist);
      formData.append("file", file);

      const res = await axios.post(
        "http://localhost:4000/upload/song",
        formData,
        {
          withCredentials: true, // ✅ Send JWT cookie
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Upload successful!");
      setTitle("");
      setArtist("");
      setFile(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Upload failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-neutral-800 rounded-lg max-w-lg"
    >
      <h2 className="text-xl font-semibold text-white">Upload a Song</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Song title"
        className="w-full p-2 rounded bg-neutral-700 text-white"
      />

      <input
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        placeholder="Artist (optional)"
        className="w-full p-2 rounded bg-neutral-700 text-white"
      />

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-white"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
