"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import SongCard from "@/components/SongCard";

type Song = {
  id: number;
  title: string;
  artist: string | null;
  duration: string | null;
};

export default function SongList() {
  const [query, setQuery] = useState("");
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [displayedSongs, setDisplayedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await axios.get("/api/songs", { withCredentials: true });
        setAllSongs(res.data);
        setDisplayedSongs(res.data);
      } catch (err) {
        console.error("Failed to fetch songs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const handleSearch = () => {
    if (!query.trim()) {
      setDisplayedSongs(allSongs);
    } else {
      const filtered = allSongs.filter((song) =>
        song.title.toLowerCase().includes(query.toLowerCase())
      );
      setDisplayedSongs(filtered);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Search songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="px-3 py-2 rounded bg-neutral-800 text-white w-full"
        />
        <button
          onClick={handleSearch}
          className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded text-white"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-gray-400">Loading songs...</p>}

      {displayedSongs.length === 0 && !loading && (
        <p className="text-gray-500">No songs found.</p>
      )}

      <div className="space-y-3">
        {displayedSongs.map((song) => (
          <SongCard
            key={song.id}
            id={song.id}
            title={song.title}
            artist={song.artist || "Unknown"}
            duration={song.duration || "0:00"}
            fileUrl={`${process.env.NEXT_PUBLIC_BACKEND_URL}/stream/${song.id}`}
          />
        ))}
      </div>
    </div>
  );
}
