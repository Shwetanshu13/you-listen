"use client";

import { trpc } from "@/utils/trpc";
import { useState, useEffect } from "react";
import SongCard from "@/components/SongCard";

export default function SongList() {
  const [query, setQuery] = useState("");

  const { refetch: refetchSearch, isFetching } =
    trpc.songs.searchSongs.useQuery({ query }, { enabled: false });

  const { data: allSongs, isLoading: isAllSongsLoading } =
    trpc.songs.getAll.useQuery();

  const [displayedSongs, setDisplayedSongs] = useState<typeof allSongs>([]);

  useEffect(() => {
    if (allSongs) {
      setDisplayedSongs(allSongs);
    }
  }, [allSongs]);

  const handleSearch = async () => {
    if (!query.trim()) {
      setDisplayedSongs(allSongs || []);
    } else {
      const result = await refetchSearch();
      setDisplayedSongs(result.data || []);
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

      {(isAllSongsLoading || isFetching) && (
        <p className="text-gray-400">Loading songs...</p>
      )}

      {displayedSongs?.length === 0 && (
        <p className="text-gray-500">No songs found.</p>
      )}

      <div className="space-y-3">
        {displayedSongs?.map((song) => (
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
