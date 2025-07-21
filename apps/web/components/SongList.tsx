"use client";

import { useEffect, useState, useCallback } from "react";
import SongCard from "@/components/SongCard";
import { SearchBar } from "@/components/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";
import axiosInstance from "@/utils/axios";
import { Music, Loader2 } from "lucide-react";

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
      const { data } = await axiosInstance.get("/songs/all");
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
      const { data } = await axiosInstance.post("/songs/search", {
        query: debouncedQuery,
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-xl" />
        <div className="relative glass rounded-3xl p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Your Music
              </h1>
              <p className="text-gray-400 text-lg">
                {displayedSongs.length}{" "}
                {displayedSongs.length === 1 ? "song" : "songs"} available
              </p>
            </div>
          </div>

          <SearchBar
            query={query}
            onChange={setQuery}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Loading State */}
      {(isLoading || isSearching) && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-pink-500/20 animate-ping" />
          </div>
          <p className="text-gray-400 text-lg">
            {isSearching ? "Searching music..." : "Loading your library..."}
          </p>
        </div>
      )}

      {/* Empty State */}
      {displayedSongs?.length === 0 && !isSearching && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <Music className="w-16 h-16 text-gray-500" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold text-gray-300">
              No songs found
            </h3>
            <p className="text-gray-500">
              {query
                ? `No results for "${query}"`
                : "Your music library is empty"}
            </p>
          </div>
        </div>
      )}

      {/* Songs Grid */}
      {displayedSongs?.length > 0 && (
        <div className="space-y-3">
          {/* Header for song list */}
          <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-400 font-medium border-b border-white/10">
            <span className="flex-1">Title</span>
            <span className="w-20 text-center">Duration</span>
            <span className="w-16"></span>
          </div>

          {/* Song List */}
          <div className="space-y-2">
            {displayedSongs.map((song, index) => (
              <div
                key={song.id}
                className="transform transition-all duration-300 hover:scale-[1.02]"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: "slideInFromLeft 0.5s ease-out forwards",
                }}
              >
                <SongCard
                  id={song.id}
                  title={song.title}
                  artist={song.artist || "Unknown"}
                  duration={song.duration || "0:00"}
                  fileUrl={`${process.env.NEXT_PUBLIC_BACKEND_URL}/stream/${song.id}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
