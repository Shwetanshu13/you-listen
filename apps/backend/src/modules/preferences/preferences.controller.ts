import { Request, Response } from "express";
import { preferencesService, PreferencesService } from "./preferences.service";

interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export class PreferencesController {
  constructor(private readonly service: PreferencesService = preferencesService) {}

  getUserPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const preferences = await this.service.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ error: "Failed to fetch user preferences" });
    }
  };

  updateUserPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { autoplay, shuffle, repeatMode, volume } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const preferences = await this.service.updateUserPreferences(
        userId,
        autoplay,
        shuffle,
        repeatMode,
        volume
      );
      res.json(preferences);
    } catch (error: any) {
      if (
        error.message === "Invalid repeat mode. Must be 'off', 'one', or 'all'" ||
        error.message === "Volume must be between 0 and 100"
      ) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error updating user preferences:", error);
      res.status(500).json({ error: "Failed to update user preferences" });
    }
  };

  resetUserPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const preferences = await this.service.resetUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error resetting user preferences:", error);
      res.status(500).json({ error: "Failed to reset user preferences" });
    }
  };
}

export const preferencesController = new PreferencesController();
