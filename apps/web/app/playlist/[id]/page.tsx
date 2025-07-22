"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, Shuffle, MoreVertical, Edit, Trash2, Music } from "lucide-react";
import axios from "@/utils/axios";
import { useAudioStore } from "@/stores/useAudioStore";

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: number | string;
  fileUrl: string;
  order: number;
  addedAt: string;
}

interface Playlist {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  songs: Song[];
}

export default function PlaylistDetail() {
  const params = useParams();
  const router = useRouter();
  const playlistId = parseInt(params.id as string);

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { setQueue } = useAudioStore();

  const fetchPlaylist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/playlists/${playlistId}`);
      setPlaylist(response.data);
      setEditName(response.data.name);
      setEditDescription(response.data.description || "");
    } catch (error) {
      console.error("Error fetching playlist:", error);
      router.push("/library");
    } finally {
      setLoading(false);
    }
  }, [playlistId, router]);

  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

  const handlePlayPlaylist = () => {
    if (!playlist || playlist.songs.length === 0) return;

    const songs = playlist.songs.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      duration: formatDuration(song.duration),
      fileUrl: song.fileUrl,
    }));

    setQueue(songs, 0);
  };

  const handleShufflePlaylist = () => {
    if (!playlist || playlist.songs.length === 0) return;

    const songs = playlist.songs.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      duration: formatDuration(song.duration),
      fileUrl: song.fileUrl,
    }));

    // Shuffle the songs
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    setQueue(shuffled, 0);
  };

  const handleUpdatePlaylist = async () => {
    try {
      const response = await axios.put(`/playlists/${playlistId}`, {
        name: editName,
        description: editDescription,
      });
      setPlaylist((prev) => (prev ? { ...prev, ...response.data } : null));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;

    try {
      await axios.delete(`/playlists/${playlistId}`);
      router.push("/library");
    } catch (error) {
      console.error("Error deleting playlist:", error);
    }
  };

  const handleRemoveSong = async (songId: number) => {
    try {
      await axios.delete(`/playlists/${playlistId}/songs/${songId}`);
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              songs: prev.songs.filter((song) => song.id !== songId),
            }
          : null
      );
    } catch (error) {
      console.error("Error removing song from playlist:", error);
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

  const getTotalDuration = () => {
    if (!playlist) return 0;
    return playlist.songs.reduce((total, song) => {
      const duration =
        typeof song.duration === "string"
          ? parseInt(song.duration) || 0
          : song.duration;
      return total + duration;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-pulse mb-4 mx-auto"></div>
          <p className="text-white text-lg">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Playlist Not Found
          </h2>
          <p className="text-gray-400">
            The playlist you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 text-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Playlist Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-xl" />
          <div className="relative glass rounded-3xl p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Playlist Art */}
              <div className="w-48 h-48 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto lg:mx-0">
                <Music className="w-24 h-24 text-white" />
              </div>

              {/* Playlist Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-400 mb-2">
                  Playlist
                </p>

                {isEditing ? (
                  <div className="space-y-4 mb-4">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-4xl font-bold bg-transparent border-b-2 border-pink-500 focus:outline-none"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 focus:outline-none focus:border-pink-500 resize-none"
                      rows={3}
                      placeholder="Add a description..."
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdatePlaylist}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg hover:from-pink-400 hover:to-purple-500 transition-all duration-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl lg:text-6xl font-bold mb-4 break-words">
                      {playlist.name}
                    </h1>
                    {playlist.description && (
                      <p className="text-gray-300 text-lg mb-4">
                        {playlist.description}
                      </p>
                    )}
                  </>
                )}

                {!isEditing && (
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
                    <span>{playlist.songs.length} songs</span>
                    <span>•</span>
                    <span>{formatDuration(getTotalDuration())}</span>
                    <span>•</span>
                    <span>Created {formatDate(playlist.createdAt)}</span>
                  </div>
                )}

                {/* Action Buttons */}
                {!isEditing && (
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={handlePlayPlaylist}
                      disabled={playlist.songs.length === 0}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-semibold hover:from-pink-400 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-5 h-5" />
                      Play
                    </button>

                    <button
                      onClick={handleShufflePlaylist}
                      disabled={playlist.songs.length === 0}
                      className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full text-white font-semibold hover:bg-white/20 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Shuffle className="w-5 h-5" />
                      Shuffle
                    </button>

                    <div className="relative group">
                      <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      <div className="absolute top-12 right-0 bg-gray-900/95 backdrop-blur-xl rounded-lg border border-white/20 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors duration-200 w-full text-left"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Playlist
                        </button>
                        <button
                          onClick={handleDeletePlaylist}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-red-500/20 text-red-400 transition-colors duration-200 w-full text-left"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Playlist
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Songs List */}
        {playlist.songs.length > 0 ? (
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-400 font-medium border-b border-white/10 mb-4">
              <div className="flex items-center gap-4">
                <span className="w-8">#</span>
                <span className="flex-1">Title</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-center">Added</span>
                <span className="w-20 text-center">Duration</span>
                <span className="w-16"></span>
              </div>
            </div>

            <div className="space-y-2">
              {playlist.songs.map((song, index) => (
                <div
                  key={`${song.id}-${song.order}`}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300"
                >
                  <span className="w-8 text-center text-gray-400 text-sm group-hover:hidden">
                    {index + 1}
                  </span>
                  <button
                    onClick={() => {
                      const songs = playlist.songs.map((s) => ({
                        id: s.id,
                        title: s.title,
                        artist: s.artist,
                        duration: formatDuration(s.duration),
                        fileUrl: s.fileUrl,
                      }));
                      setQueue(songs, index);
                    }}
                    className="w-8 h-8 bg-pink-500 rounded-full items-center justify-center hover:bg-pink-400 transition-all duration-300 hidden group-hover:flex"
                  >
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">
                      {song.title}
                    </h4>
                    <p className="text-sm text-gray-400 truncate">
                      {song.artist}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="w-20 text-center">
                      {formatDate(song.addedAt)}
                    </span>
                    <span className="w-20 text-center">
                      {formatDuration(song.duration)}
                    </span>
                    <button
                      onClick={() => handleRemoveSong(song.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No songs in this playlist
            </h3>
            <p className="text-gray-500">Add some songs to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
