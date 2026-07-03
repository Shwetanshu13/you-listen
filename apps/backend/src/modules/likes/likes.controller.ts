import { Request, Response } from "express";
import { likesService, LikesService } from "./likes.service";

interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; role: string };
}

// Helper function to handle v2 table missing errors
const handleV2NotAvailable = (res: Response, error: any) => {
  if (error.code === "42P01") {
    // PostgreSQL error code for "relation does not exist"
    return res.json({ liked: false, message: "Likes feature not available" });
  }
  throw error;
};

export class LikesController {
  constructor(private readonly service: LikesService = likesService) {}

  toggleSongLike = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { songId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!songId) {
      res.status(400).json({ error: "Song ID is required" });
      return;
    }

    try {
      const result = await this.service.toggleSongLike(userId, songId);
      res.json(result);
    } catch (error: any) {
      console.error("Error toggling song like:", error);
      try {
        handleV2NotAvailable(res, error);
      } catch {
        res.status(500).json({ error: "Failed to toggle song like" });
      }
    }
  };

  getUserLikedSongs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const likedSongs = await this.service.getUserLikedSongs(userId);
      res.json(likedSongs);
    } catch (error: any) {
      console.error("Error fetching liked songs:", error);
      if (error.code === "42P01") {
        // Table doesn't exist, return empty array
        res.json([]);
        return;
      }
      res.status(500).json({ error: "Failed to fetch liked songs" });
    }
  };

  checkSongLikeStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const songId = parseInt(req.params.songId);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (isNaN(songId)) {
      res.status(400).json({ error: "Invalid song ID" });
      return;
    }

    try {
      const result = await this.service.checkSongLikeStatus(userId, songId);
      res.json(result);
    } catch (error: any) {
      console.error("Error checking song like status:", error);
      try {
        handleV2NotAvailable(res, error);
      } catch {
        res.status(500).json({ error: "Failed to check song like status" });
      }
    }
  };

  getSongLikeCount = async (req: Request, res: Response): Promise<void> => {
    const songId = parseInt(req.params.songId);

    if (isNaN(songId)) {
      res.status(400).json({ error: "Invalid song ID" });
      return;
    }

    try {
      const count = await this.service.getSongLikeCount(songId);
      res.json({ count });
    } catch (error: any) {
      console.error("Error getting song like count:", error);
      try {
        if (error.code === "42P01") {
          res.json({ count: 0 });
          return;
        }
      } catch {}
      res.status(500).json({ error: "Failed to get song like count" });
    }
  };
}

export const likesController = new LikesController();
