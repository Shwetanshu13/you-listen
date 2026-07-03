import { Request, Response } from "express";
import { songsService, SongsService } from "./songs.service";

interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export class SongsController {
  constructor(private readonly service: SongsService = songsService) {}

  getAllSongs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const result = await this.service.getAllSongs(limit, offset, userId);
      res.json(result);
    } catch (error) {
      console.error("Error fetching songs:", error);
      res.status(500).json({ error: "Failed to fetch songs" });
    }
  };

  getSongDetail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const songId = parseInt(req.params.songId);
    const userId = req.user?.id;

    if (isNaN(songId)) {
      res.status(400).json({ error: "Invalid song ID" });
      return;
    }

    try {
      const result = await this.service.getSongDetail(songId, userId);
      if (!result) {
        res.status(404).json({ error: "Song not found" });
        return;
      }
      res.json(result);
    } catch (error) {
      console.error("Error fetching song detail:", error);
      res.status(500).json({ error: "Failed to fetch song detail" });
    }
  };

  searchSongs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const query = req.params.q;
    const userId = req.user?.id;

    if (!query || query.length < 2) {
      res.status(400).json({ error: "Invalid search query" });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const result = await this.service.searchSongs(query, limit, offset, userId);
      res.json(result);
    } catch (error) {
      console.error("Error searching songs:", error);
      res.status(500).json({ error: "Failed to search songs" });
    }
  };

  searchByTitleOrArtist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { query } = req.body;
    const userId = req.user?.id;

    if (!query || query.length < 1) {
      res.status(400).json({ error: "Query must be at least 1 character" });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const result = await this.service.searchByTitleOrArtist(query, limit, offset, userId);
      res.json(result);
    } catch (error) {
      console.error("Error searching songs:", error);
      res.status(500).json({ error: "Failed to search songs" });
    }
  };

  ingestYouTubeSong = async (req: Request, res: Response): Promise<void> => {
    const { title, artist, youtubeUrl } = req.body;
    const user = (req as any).user;

    if (!title || !artist || !youtubeUrl) {
      res.status(400).json({ error: "Missing input" });
      return;
    }

    try {
      await this.service.ingestYouTubeSong(title, artist, youtubeUrl, user.username);
      res.json({ message: "Song upload added to queue" });
    } catch (error) {
      console.error("Error queueing download:", error);
      res.status(500).json({ error: "Failed to queue download" });
    }
  };

  deleteSong = async (req: Request, res: Response): Promise<void> => {
    const { id, fileUrl } = req.body;
    if (!id || !fileUrl) {
      res.status(400).json({ error: "Missing ID or fileUrl" });
      return;
    }

    try {
      await this.service.deleteSong(id, fileUrl);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting song:", err);
      res.status(500).json({ error: "Failed to delete song" });
    }
  };

  updateSong = async (req: Request, res: Response): Promise<void> => {
    const songId = parseInt(req.params.id);
    const { title, artist } = req.body;

    if (isNaN(songId)) {
      res.status(400).json({ error: "Invalid song ID" });
      return;
    }

    try {
      const song = await this.service.updateSong(songId, title, artist);

      if (!song) {
        res.status(404).json({ error: "Song not found" });
        return;
      }

      res.json({ success: true, song });
    } catch (error) {
      console.error("Error updating song:", error);
      res.status(500).json({ error: "Failed to update song" });
    }
  };
}

export const songsController = new SongsController();
