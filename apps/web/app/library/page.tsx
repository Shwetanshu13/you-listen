"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  Clock,
  ListMusic,
  TrendingUp,
  Music,
  Plus,
  Play,
} from "lucide-react";
import axios from "@/utils/axios";
import { useAudioStore } from "@/stores/useAudioStore";

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: number | string;
  fileUrl: string;
  isLiked?: boolean;
  likedAt?: string;
  lastPlayed?: string;
  playCount?: number;
}

interface Playlist {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  songs?: Song[];
}

const Library = () => {
  const [activeTab, setActiveTab] = useState<
    "liked" | "playlists" | "recent" | "most-played"
  >("liked");
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [mostPlayed, setMostPlayed] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");

  const { setQueue } = useAudioStore();

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      const [likedRes, playlistsRes, recentRes, mostPlayedRes] =
        await Promise.all([
          axios.get("/likes/songs"),
          axios.get("/playlists"),
          axios.get("/history/recent?limit=20"),
          axios.get("/history/most-played?limit=20&timeframe=month"),
        ]);

      setLikedSongs(likedRes.data);
      setPlaylists(playlistsRes.data);
      setRecentlyPlayed(recentRes.data);
      setMostPlayed(mostPlayedRes.data);
    } catch (error) {
      console.error("Error fetching library data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    try {
      await axios.post("/playlists", {
        name: newPlaylistName,
        description: newPlaylistDescription,
        isPublic: false,
      });

      setNewPlaylistName("");
      setNewPlaylistDescription("");
      setShowCreatePlaylist(false);
      fetchLibraryData();
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  const formatDuration = (duration: number | string) => {
    // If duration is already formatted as string (MM:SS), return it
    if (typeof duration === "string" && duration.includes(":")) {
      return duration;
    }

    // If duration is a number (seconds), convert to MM:SS format
    const seconds =
      typeof duration === "string" ? parseInt(duration) || 0 : duration;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const tabs = [
    {
      id: "liked" as const,
      label: "Liked Songs",
      icon: Heart,
      count: likedSongs.length,
    },
    {
      id: "playlists" as const,
      label: "Playlists",
      icon: ListMusic,
      count: playlists.length,
    },
    {
      id: "recent" as const,
      label: "Recently Played",
      icon: Clock,
      count: recentlyPlayed.length,
    },
    {
      id: "most-played" as const,
      label: "Most Played",
      icon: TrendingUp,
      count: mostPlayed.length,
    },
  ];

  const renderSongList = (
    songs: Song[],
    showDate = false,
    dateKey?: string
  ) => (
    <div className="space-y-2">
      {songs.map((song, index) => (
        <div
          key={`${song.id}-${index}`}
          className="group flex items-center gap-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Music className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white truncate">{song.title}</h4>
            <p className="text-sm text-gray-400 truncate">{song.artist}</p>
            {showDate &&
              dateKey &&
              (song as Song & { [key: string]: string })[dateKey] && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(
                    (song as Song & { [key: string]: string })[dateKey]
                  )}
                </p>
              )}
          </div>

          <div className="flex items-center gap-3">
            {song.playCount && (
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                {song.playCount} plays
              </span>
            )}
            <span className="text-sm text-gray-400">
              {formatDuration(song.duration)}
            </span>
            <button
              onClick={() => {
                // Create a queue with just this song or all songs in the current list
                const currentSongs =
                  activeTab === "liked"
                    ? likedSongs
                    : activeTab === "recent"
                    ? recentlyPlayed
                    : activeTab === "most-played"
                    ? mostPlayed
                    : [];

                const songIndex = currentSongs.findIndex(
                  (s) => s.id === song.id
                );
                const audioSongs = currentSongs.map((s) => ({
                  id: s.id,
                  title: s.title,
                  artist: s.artist,
                  duration: formatDuration(s.duration),
                  fileUrl:
                    s.fileUrl ||
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/stream/${s.id}`,
                }));

                setQueue(audioSongs, songIndex >= 0 ? songIndex : 0);
              }}
              className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center hover:bg-pink-400 transition-all duration-300"
            >
              <Play className="w-4 h-4 text-white ml-0.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPlaylists = () => (
    <div className="space-y-4">
      <button
        onClick={() => setShowCreatePlaylist(true)}
        className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 group"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <h4 className="font-semibold text-white">Create Playlist</h4>
          <p className="text-sm text-gray-400">
            Build your perfect music collection
          </p>
        </div>
      </button>

      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          onClick={() => (window.location.href = `/playlist/${playlist.id}`)}
          className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <ListMusic className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white truncate">
              {playlist.name}
            </h4>
            {playlist.description && (
              <p className="text-sm text-gray-400 truncate">
                {playlist.description}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Created {formatDate(playlist.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
              {playlist.songs?.length || 0} songs
            </span>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  // Fetch playlist details to get songs
                  const response = await axios.get(`/playlists/${playlist.id}`);
                  const playlistData = response.data;

                  if (playlistData.songs && playlistData.songs.length > 0) {
                    const audioSongs = playlistData.songs.map((song: any) => ({
                      id: song.id,
                      title: song.title,
                      artist: song.artist,
                      duration: formatDuration(song.duration),
                      fileUrl:
                        song.fileUrl ||
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stream/${song.id}`,
                    }));

                    setQueue(audioSongs, 0);
                  }
                } catch (error) {
                  console.error("Error playing playlist:", error);
                }
              }}
              className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center hover:bg-purple-400 transition-all duration-300"
            >
              <Play className="w-4 h-4 text-white ml-0.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-pulse mb-4 mx-auto"></div>
          <p className="text-white text-lg">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 text-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Your Library
          </h1>
          <p className="text-gray-400">
            Your personal music collection and history
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          {activeTab === "liked" && (
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Heart className="w-6 h-6 text-pink-500" />
                Liked Songs ({likedSongs.length})
              </h3>
              {likedSongs.length > 0 ? (
                renderSongList(likedSongs, true, "likedAt")
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No liked songs yet</p>
                  <p className="text-gray-500">
                    Start liking songs to build your collection!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "playlists" && (
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <ListMusic className="w-6 h-6 text-blue-500" />
                Playlists ({playlists.length})
              </h3>
              {renderPlaylists()}
            </div>
          )}

          {activeTab === "recent" && (
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-green-500" />
                Recently Played ({recentlyPlayed.length})
              </h3>
              {recentlyPlayed.length > 0 ? (
                renderSongList(recentlyPlayed, true, "lastPlayed")
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No recent plays</p>
                  <p className="text-gray-500">
                    Start listening to see your history!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "most-played" && (
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                Most Played This Month ({mostPlayed.length})
              </h3>
              {mostPlayed.length > 0 ? (
                renderSongList(mostPlayed)
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No plays this month</p>
                  <p className="text-gray-500">
                    Listen to more music to see your top tracks!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreatePlaylist && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Playlist</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                  placeholder="Enter playlist name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none"
                  rows={3}
                  placeholder="Describe your playlist"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreatePlaylist(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={createPlaylist}
                disabled={!newPlaylistName.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
