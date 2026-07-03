import { Request, Response } from "express";
import { historyService, HistoryService } from "./history.service";

interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export class HistoryController {
  constructor(private readonly service: HistoryService = historyService) {}

  addToPlayHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { songId, playedDuration } = req.body;
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
      const result = await this.service.addToPlayHistory(userId, songId, playedDuration);
      res.status(result.message === "Added to play history successfully" ? 201 : 200).json(result);
    } catch (error) {
      console.error("Error adding to play history:", error);
      res.status(500).json({ error: "Failed to add to play history" });
    }
  };

  getUserPlayHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const history = await this.service.getUserPlayHistory(userId, limit, offset);
      res.json(history);
    } catch (error) {
      console.error("Error fetching play history:", error);
      res.status(500).json({ error: "Failed to fetch play history" });
    }
  };

  getRecentlyPlayed = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const recentlyPlayed = await this.service.getRecentlyPlayed(userId, limit);
      res.json(recentlyPlayed);
    } catch (error: any) {
      console.error("Error fetching recently played songs:", error);
      if (error.code === "42P01") {
        res.json([]);
        return;
      }
      res.status(500).json({ error: "Failed to fetch recently played songs" });
    }
  };

  getMostPlayed = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 10;
    const timeframe = (req.query.timeframe as string) || "all";

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const mostPlayed = await this.service.getMostPlayed(userId, timeframe, limit);
      res.json(mostPlayed);
    } catch (error: any) {
      console.error("Error fetching most played songs:", error);
      if (error.code === "42P01") {
        res.json([]);
        return;
      }
      res.status(500).json({ error: "Failed to fetch most played songs" });
    }
  };

  clearPlayHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      await this.service.clearPlayHistory(userId);
      res.json({ message: "Play history cleared successfully" });
    } catch (error) {
      console.error("Error clearing play history:", error);
      res.status(500).json({ error: "Failed to clear play history" });
    }
  };
}

export const historyController = new HistoryController();
