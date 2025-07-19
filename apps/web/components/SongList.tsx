"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import SongCard from "@/components/SongCard";
import { SearchBar } from "@/components/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";

export default function SongList() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { refetch: refetchSearch, isFetching } =
    trpc.songs.searchSongs.useQuery(
      { query: debouncedQuery },
      { enabled: false }
    );

  const { data: allSongs, isLoading: isAllSongsLoading } =
    trpc.songs.getAll.useQuery();

  const [displayedSongs, setDisplayedSongs] = useState<typeof allSongs>([]);

  useEffect(() => {
    if (query.trim() === "") {
      setDisplayedSongs(allSongs || []);
    } else {
      handleSearch();
    }
  }, [debouncedQuery]);

  const handleSearch = async () => {
    if (!debouncedQuery.trim()) {
      setDisplayedSongs(allSongs || []);
    } else {
      const result = await refetchSearch();
      setDisplayedSongs(result.data || []);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <SearchBar query={query} onChange={setQuery} onSearch={handleSearch} />

      {(isAllSongsLoading || isFetching) && (
        <p className="text-gray-400">Loading songs...</p>
      )}

      {displayedSongs?.length === 0 && !isFetching && (
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
