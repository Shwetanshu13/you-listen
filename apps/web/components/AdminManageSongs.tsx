"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "@/utils/axios";
import { Trash2, Music, Edit2, X, Check } from "lucide-react";

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: string;
  fileUrl: string;
  uploadedAt: string;
}

export default function AdminManageSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/songs/all");
      setSongs(res.data);
    } catch (error) {
      toast.error("Failed to fetch songs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleDelete = async (id: number, fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this song?")) return;
    try {
      await axios.delete(`/songs`, { data: { id, fileUrl } });
      toast.success("Song deleted successfully");
      fetchSongs();
    } catch (error) {
      toast.error("Failed to delete song");
    }
  };

  const handleEditStart = (song: Song) => {
    setEditingId(song.id);
    setEditTitle(song.title);
    setEditArtist(song.artist || "");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle("");
    setEditArtist("");
  };

  const handleEditSave = async (id: number) => {
    try {
      await axios.patch(`/songs/${id}`, { title: editTitle, artist: editArtist });
      toast.success("Song updated successfully");
      setEditingId(null);
      fetchSongs();
    } catch (error) {
      toast.error("Failed to update song");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
          <Music className="text-white w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Manage Songs</h2>
          <p className="text-gray-400">View, edit, and remove tracks</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium text-white">Title</th>
                <th className="px-6 py-4 font-medium text-white">Artist</th>
                <th className="px-6 py-4 font-medium text-white">Duration</th>
                <th className="px-6 py-4 font-medium text-white">Uploaded At</th>
                <th className="px-6 py-4 font-medium text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="w-6 h-6 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : songs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No songs found
                  </td>
                </tr>
              ) : (
                songs.map((song) => (
                  <tr key={song.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      {editingId === song.id ? (
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full p-2 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:border-pink-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-white">{song.title}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === song.id ? (
                        <input
                          value={editArtist}
                          onChange={(e) => setEditArtist(e.target.value)}
                          className="w-full p-2 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:border-pink-500"
                        />
                      ) : (
                        <span className="text-gray-400">{song.artist || "Unknown Artist"}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {song.duration}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(song.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {editingId === song.id ? (
                          <>
                            <button
                              onClick={() => handleEditSave(song.id)}
                              className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="p-2 hover:bg-gray-500/20 rounded-lg text-gray-400 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditStart(song)}
                              className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                              title="Edit Song"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(song.id, song.fileUrl)}
                              className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                              title="Delete Song"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
