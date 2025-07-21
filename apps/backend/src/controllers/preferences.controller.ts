// controllers/preferences.controller.ts
import { Request, Response } from "express";
import { db } from "../lib/db";
import { userPreferences } from "../db/schema";
import { eq } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export const getUserPreferences = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    if (!preferences) {
      // Create default preferences if they don't exist
      const [newPreferences] = await db
        .insert(userPreferences)
        .values({
          userId,
          autoplay: true,
          shuffle: false,
          repeatMode: "off",
          volume: 80,
        })
        .returning();

      res.json(newPreferences);
    } else {
      res.json(preferences);
    }
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    res.status(500).json({ error: "Failed to fetch user preferences" });
  }
};

export const updateUserPreferences = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;
  const { autoplay, shuffle, repeatMode, volume } = req.body;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Check if preferences exist
    const [existingPreferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    const updateData: Partial<{
      autoplay: boolean;
      shuffle: boolean;
      repeatMode: "off" | "one" | "all";
      volume: number;
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (autoplay !== undefined) updateData.autoplay = autoplay;
    if (shuffle !== undefined) updateData.shuffle = shuffle;
    if (repeatMode !== undefined) {
      if (["off", "one", "all"].includes(repeatMode)) {
        updateData.repeatMode = repeatMode;
      } else {
        res
          .status(400)
          .json({
            error: "Invalid repeat mode. Must be 'off', 'one', or 'all'",
          });
        return;
      }
    }
    if (volume !== undefined) {
      if (volume >= 0 && volume <= 100) {
        updateData.volume = volume;
      } else {
        res.status(400).json({ error: "Volume must be between 0 and 100" });
        return;
      }
    }

    if (existingPreferences) {
      // Update existing preferences
      const [updatedPreferences] = await db
        .update(userPreferences)
        .set(updateData)
        .where(eq(userPreferences.userId, userId))
        .returning();

      res.json(updatedPreferences);
    } else {
      // Create new preferences
      const [newPreferences] = await db
        .insert(userPreferences)
        .values({
          userId,
          autoplay: autoplay ?? true,
          shuffle: shuffle ?? false,
          repeatMode: repeatMode ?? "off",
          volume: volume ?? 80,
        })
        .returning();

      res.json(newPreferences);
    }
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({ error: "Failed to update user preferences" });
  }
};

export const resetUserPreferences = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [resetPreferences] = await db
      .update(userPreferences)
      .set({
        autoplay: true,
        shuffle: false,
        repeatMode: "off",
        volume: 80,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, userId))
      .returning();

    if (!resetPreferences) {
      // If no preferences exist, create default ones
      const [newPreferences] = await db
        .insert(userPreferences)
        .values({
          userId,
          autoplay: true,
          shuffle: false,
          repeatMode: "off",
          volume: 80,
        })
        .returning();

      res.json(newPreferences);
    } else {
      res.json(resetPreferences);
    }
  } catch (error) {
    console.error("Error resetting user preferences:", error);
    res.status(500).json({ error: "Failed to reset user preferences" });
  }
};
