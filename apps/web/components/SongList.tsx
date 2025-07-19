"use client";

import { useEffect, useState, useCallback } from "react";
import SongCard from "@/components/SongCard";
import { SearchBar } from "@/components/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";
import axiosInstance from "@/utils/axios";

interface Song {
  id: number;
  title: string;
  artist?: string;
  duration?: string;
}

export default function SongList() {
  const [query, setQuery] = useState("");
  const [displayedSongs, setDisplayedSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const fetchAllSongs = async () => {
    try {
      const { data } = await axiosInstance.get("/songs");
      setDisplayedSongs(data);
    } catch (err) {
      console.error("Failed to fetch songs", err);
    } finally {
      setIsLoading(false);
    }
  };

  const searchSongs = useCallback(async () => {
    try {
      setIsSearching(true);
      const { data } = await axiosInstance.get("/songs/search", {
        params: { query: debouncedQuery },
      });
      setDisplayedSongs(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    if (debouncedQuery.trim() === "") {
      fetchAllSongs();
    } else {
      searchSongs();
    }
  }, [debouncedQuery, searchSongs]);

  const handleSearch = () => {
    if (query.trim() === "") fetchAllSongs();
    else searchSongs();
  };

  return (
    <div className="p-4 space-y-6">
      <SearchBar query={query} onChange={setQuery} onSearch={handleSearch} />

      {(isLoading || isSearching) && (
        <p className="text-gray-400">Loading songs...</p>
      )}

      {displayedSongs?.length === 0 && !isSearching && (
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
