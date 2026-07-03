import { Request, Response } from "express";
import { playlistsService, PlaylistsService } from "./playlists.service";

interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; role: string };
}

// Helper function to handle v2 table missing errors
const handleV2NotAvailable = (res: Response, error: any) => {
  if (error.code === "42P01") {
    // PostgreSQL error code for "relation does not exist"
    return res.status(503).json({
      error: "Playlists feature not available",
      message: "Database migration required",
    });
  }
  throw error;
};

export class PlaylistsController {
  constructor(private readonly service: PlaylistsService = playlistsService) {}

  createPlaylist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { name, description, isPublic } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const playlist = await this.service.createPlaylist(name, description, userId, isPublic);
      res.status(201).json(playlist);
    } catch (error: any) {
      if (error.message === "Playlist name is required") {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error creating playlist:", error);
      try {
        handleV2NotAvailable(res, error);
      } catch {
        res.status(500).json({ error: "Failed to create playlist" });
      }
    }
  };

  getUserPlaylists = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const playlists = await this.service.getUserPlaylists(userId);
      res.json(playlists);
    } catch (error: any) {
      console.error("Error fetching playlists:", error);
      if (error.code === "42P01") {
        res.json([]);
        return;
      }
      res.status(500).json({ error: "Failed to fetch playlists" });
    }
  };

  getPlaylistById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const playlistId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (isNaN(playlistId)) {
      res.status(400).json({ error: "Invalid playlist ID" });
      return;
    }

    try {
      const playlist = await this.service.getPlaylistById(playlistId, userId);
      if (!playlist) {
        res.status(404).json({ error: "Playlist not found" });
        return;
      }
      res.json(playlist);
    } catch (error) {
      console.error("Error fetching playlist:", error);
      res.status(500).json({ error: "Failed to fetch playlist" });
    }
  };

  addSongToPlaylist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const playlistId = parseInt(req.params.id);
    const { songId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (isNaN(playlistId) || !songId) {
      res.status(400).json({ error: "Invalid playlist ID or song ID" });
      return;
    }

    try {
      await this.service.addSongToPlaylist(playlistId, songId, userId);
      res.status(201).json({ message: "Song added to playlist successfully" });
    } catch (error: any) {
      if (error.message === "Playlist not found") {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message === "Song already in playlist") {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error adding song to playlist:", error);
      res.status(500).json({ error: "Failed to add song to playlist" });
    }
  };

  removeSongFromPlaylist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const playlistId = parseInt(req.params.id);
    const songId = parseInt(req.params.songId);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (isNaN(playlistId) || isNaN(songId)) {
      res.status(400).json({ error: "Invalid playlist ID or song ID" });
      return;
    }

    try {
      await this.service.removeSongFromPlaylist(playlistId, songId, userId);
      res.json({ message: "Song removed from playlist successfully" });
    } catch (error: any) {
      if (error.message === "Playlist not found") {
        res.status(404).json({ error: error.message });
        return;
      }
      console.error("Error removing song from playlist:", error);
      res.status(500).json({ error: "Failed to remove song from playlist" });
    }
  };

  deletePlaylist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const playlistId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (isNaN(playlistId)) {
      res.status(400).json({ error: "Invalid playlist ID" });
      return;
    }

    try {
      await this.service.deletePlaylist(playlistId, userId);
      res.json({ message: "Playlist deleted successfully" });
    } catch (error: any) {
      if (error.message === "Playlist not found") {
        res.status(404).json({ error: error.message });
        return;
      }
      console.error("Error deleting playlist:", error);
      res.status(500).json({ error: "Failed to delete playlist" });
    }
  };

  updatePlaylist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const playlistId = parseInt(req.params.id);
    const { name, description, isPublic } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (isNaN(playlistId)) {
      res.status(400).json({ error: "Invalid playlist ID" });
      return;
    }

    try {
      const updated = await this.service.updatePlaylist(playlistId, userId, name, description, isPublic);
      res.json(updated);
    } catch (error: any) {
      if (error.message === "Playlist not found") {
        res.status(404).json({ error: error.message });
        return;
      }
      console.error("Error updating playlist:", error);
      res.status(500).json({ error: "Failed to update playlist" });
    }
  };
}

export const playlistsController = new PlaylistsController();
