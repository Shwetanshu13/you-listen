"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, ListMusic, Check } from "lucide-react";
import axios from "@/utils/axios";

interface Playlist {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PlaylistSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  songId: number;
  songTitle: string;
}

export default function PlaylistSelector({
  isOpen,
  onClose,
  songId,
  songTitle,
}: PlaylistSelectorProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [adding, setAdding] = useState<number | null>(null);
  const [addedToPlaylists, setAddedToPlaylists] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/playlists");
      setPlaylists(response.data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    try {
      setLoading(true);
      const response = await axios.post("/playlists", {
        name: newPlaylistName,
        description: newPlaylistDescription,
        isPublic: false,
      });

      const newPlaylist = response.data;
      setPlaylists((prev) => [newPlaylist, ...prev]);

      // Automatically add the song to the new playlist
      await addToPlaylist(newPlaylist.id);

      setNewPlaylistName("");
      setNewPlaylistDescription("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToPlaylist = async (playlistId: number) => {
    try {
      setAdding(playlistId);
      await axios.post(`/playlists/${playlistId}/songs`, { songId });

      setAddedToPlaylists((prev) => new Set([...prev, playlistId]));

      // Remove from added state after 2 seconds
      setTimeout(() => {
        setAddedToPlaylists((prev) => {
          const newSet = new Set(prev);
          newSet.delete(playlistId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error("Error adding song to playlist:", error);
    } finally {
      setAdding(null);
    }
  };

  const handleClose = () => {
    setShowCreateForm(false);
    setNewPlaylistName("");
    setNewPlaylistDescription("");
    setAddedToPlaylists(new Set());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white">Add to Playlist</h3>
            <p className="text-sm text-gray-400 truncate">{songTitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Create New Playlist Button */}
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 mb-4"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-white">Create New Playlist</h4>
              <p className="text-sm text-gray-400">
                Make a new playlist for this song
              </p>
            </div>
          </button>

          {/* Create Playlist Form */}
          {showCreateForm && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    placeholder="Enter playlist name"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none"
                    rows={2}
                    placeholder="Describe your playlist"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createPlaylist}
                    disabled={!newPlaylistName.trim() || loading}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 rounded-lg text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create & Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Existing Playlists */}
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-pulse mx-auto mb-2"></div>
              <p className="text-gray-400">Loading playlists...</p>
            </div>
          ) : playlists.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Your Playlists
              </h4>
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => addToPlaylist(playlist.id)}
                  disabled={adding === playlist.id}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    {addedToPlaylists.has(playlist.id) ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <ListMusic className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-white truncate">
                      {playlist.name}
                    </h4>
                    {playlist.description && (
                      <p className="text-sm text-gray-400 truncate">
                        {playlist.description}
                      </p>
                    )}
                  </div>
                  {adding === playlist.id && (
                    <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {addedToPlaylists.has(playlist.id) && (
                    <span className="text-xs text-green-400 font-medium">
                      Added!
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ListMusic className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No playlists yet</p>
              <p className="text-gray-500 text-sm">
                Create your first playlist above
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
