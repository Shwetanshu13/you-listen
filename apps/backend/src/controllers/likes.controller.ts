// controllers/likes.controller.ts
import { Request, Response } from "express";
import { db } from "../lib/db";
import { songLikes, songs } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export const toggleSongLike = async (
  req: AuthenticatedRequest,
  res: Response
) => {
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
    // Check if like already exists
    const [existingLike] = await db
      .select()
      .from(songLikes)
      .where(and(eq(songLikes.userId, userId), eq(songLikes.songId, songId)));

    if (existingLike) {
      // Unlike the song
      await db
        .delete(songLikes)
        .where(and(eq(songLikes.userId, userId), eq(songLikes.songId, songId)));

      res.json({
        liked: false,
        message: "Song unliked successfully",
      });
    } else {
      // Like the song
      await db.insert(songLikes).values({
        userId,
        songId,
      });

      res.json({
        liked: true,
        message: "Song liked successfully",
      });
    }
  } catch (error) {
    console.error("Error toggling song like:", error);
    res.status(500).json({ error: "Failed to toggle song like" });
  }
};

export const getUserLikedSongs = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const likedSongs = await db
      .select({
        id: songs.id,
        title: songs.title,
        artist: songs.artist,
        duration: songs.duration,
        fileUrl: songs.fileUrl,
        likedAt: songLikes.likedAt,
      })
      .from(songLikes)
      .innerJoin(songs, eq(songLikes.songId, songs.id))
      .where(eq(songLikes.userId, userId))
      .orderBy(desc(songLikes.likedAt));

    res.json(likedSongs);
  } catch (error) {
    console.error("Error fetching liked songs:", error);
    res.status(500).json({ error: "Failed to fetch liked songs" });
  }
};

export const checkSongLikeStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
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
    const [like] = await db
      .select()
      .from(songLikes)
      .where(and(eq(songLikes.userId, userId), eq(songLikes.songId, songId)));

    res.json({
      liked: !!like,
      likedAt: like?.likedAt || null,
    });
  } catch (error) {
    console.error("Error checking song like status:", error);
    res.status(500).json({ error: "Failed to check song like status" });
  }
};

export const getSongLikeCount = async (req: Request, res: Response) => {
  const songId = parseInt(req.params.songId);

  if (isNaN(songId)) {
    res.status(400).json({ error: "Invalid song ID" });
    return;
  }

  try {
    const [result] = await db
      .select({ count: songLikes.id })
      .from(songLikes)
      .where(eq(songLikes.songId, songId));

    res.json({ count: result?.count || 0 });
  } catch (error) {
    console.error("Error getting song like count:", error);
    res.status(500).json({ error: "Failed to get song like count" });
  }
};
