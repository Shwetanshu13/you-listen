// controllers/history.controller.ts
import { Request, Response } from "express";
import { db } from "../lib/db";
import { playHistory, songs } from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export const addToPlayHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
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
    // Check if this song was played recently (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const [recentPlay] = await db
      .select()
      .from(playHistory)
      .where(
        and(
          eq(playHistory.userId, userId),
          eq(playHistory.songId, songId),
          sql`${playHistory.playedAt} > ${fiveMinutesAgo}`
        )
      )
      .orderBy(desc(playHistory.playedAt))
      .limit(1);

    if (recentPlay) {
      // Update the existing recent play record
      await db
        .update(playHistory)
        .set({
          playedAt: new Date(),
          duration: playedDuration || recentPlay.duration,
        })
        .where(eq(playHistory.id, recentPlay.id));

      res.json({ message: "Play history updated successfully" });
    } else {
      // Create new play history record
      await db.insert(playHistory).values({
        userId,
        songId,
        duration: playedDuration || 0,
      });

      res.status(201).json({ message: "Added to play history successfully" });
    }
  } catch (error) {
    console.error("Error adding to play history:", error);
    res.status(500).json({ error: "Failed to add to play history" });
  }
};

export const getUserPlayHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const history = await db
      .select({
        id: playHistory.id,
        songId: songs.id,
        title: songs.title,
        artist: songs.artist,
        duration: songs.duration,
        fileUrl: songs.fileUrl,
        playedAt: playHistory.playedAt,
        playedDuration: playHistory.duration,
      })
      .from(playHistory)
      .innerJoin(songs, eq(playHistory.songId, songs.id))
      .where(eq(playHistory.userId, userId))
      .orderBy(desc(playHistory.playedAt))
      .limit(limit)
      .offset(offset);

    res.json(history);
  } catch (error) {
    console.error("Error fetching play history:", error);
    res.status(500).json({ error: "Failed to fetch play history" });
  }
};

export const getRecentlyPlayed = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const limit = parseInt(req.query.limit as string) || 10;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Get recently played songs (unique songs from last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentlyPlayed = await db
      .selectDistinct({
        id: songs.id,
        title: songs.title,
        artist: songs.artist,
        duration: songs.duration,
        fileUrl: songs.fileUrl,
        lastPlayed: sql`MAX(${playHistory.playedAt})`.as("lastPlayed"),
      })
      .from(playHistory)
      .innerJoin(songs, eq(playHistory.songId, songs.id))
      .where(
        and(
          eq(playHistory.userId, userId),
          sql`${playHistory.playedAt} > ${sevenDaysAgo}`
        )
      )
      .groupBy(
        songs.id,
        songs.title,
        songs.artist,
        songs.duration,
        songs.fileUrl
      )
      .orderBy(desc(sql`MAX(${playHistory.playedAt})`))
      .limit(limit);

    res.json(recentlyPlayed);
  } catch (error: any) {
    console.error("Error fetching recently played songs:", error);
    if (error.code === "42P01") {
      // Table doesn't exist, return empty array
      res.json([]);
      return;
    }
    res.status(500).json({ error: "Failed to fetch recently played songs" });
  }
};

export const getMostPlayed = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const limit = parseInt(req.query.limit as string) || 10;
  const timeframe = (req.query.timeframe as string) || "all"; // 'week', 'month', 'year', 'all'

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    let dateFilter;
    const now = new Date();

    switch (timeframe) {
      case "week":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = null;
    }

    const whereCondition = dateFilter
      ? and(
          eq(playHistory.userId, userId),
          sql`${playHistory.playedAt} > ${dateFilter}`
        )
      : eq(playHistory.userId, userId);

    const mostPlayed = await db
      .select({
        id: songs.id,
        title: songs.title,
        artist: songs.artist,
        duration: songs.duration,
        fileUrl: songs.fileUrl,
        playCount: sql`COUNT(${playHistory.id})`.as("playCount"),
        totalPlayedDuration: sql`SUM(${playHistory.duration})`.as(
          "totalPlayedDuration"
        ),
      })
      .from(playHistory)
      .innerJoin(songs, eq(playHistory.songId, songs.id))
      .where(whereCondition)
      .groupBy(
        songs.id,
        songs.title,
        songs.artist,
        songs.duration,
        songs.fileUrl
      )
      .orderBy(desc(sql`COUNT(${playHistory.id})`))
      .limit(limit);

    res.json(mostPlayed);
  } catch (error: any) {
    console.error("Error fetching most played songs:", error);
    if (error.code === "42P01") {
      // Table doesn't exist, return empty array
      res.json([]);
      return;
    }
    res.status(500).json({ error: "Failed to fetch most played songs" });
  }
};

export const clearPlayHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await db.delete(playHistory).where(eq(playHistory.userId, userId));
    res.json({ message: "Play history cleared successfully" });
  } catch (error) {
    console.error("Error clearing play history:", error);
    res.status(500).json({ error: "Failed to clear play history" });
  }
};
