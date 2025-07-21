// controllers/songs.controller.ts
import { Request, Response } from "express";
import { db } from "../lib/db";
import { songs, songLikes } from "../db/schema";
import { eq, ilike, or, sql } from "drizzle-orm";
import { deleteFromBucket } from "../lib/r2";
import { audioDownloadQueue } from "../queues/audioDownloadQueue";

interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export const getAllSongs = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    let result;

    if (userId) {
      // Include like status for authenticated users
      result = await db
        .select({
          id: songs.id,
          title: songs.title,
          artist: songs.artist,
          duration: songs.duration,
          fileUrl: songs.fileUrl,
          uploadedAt: songs.uploadedAt,
          isLiked:
            sql`CASE WHEN ${songLikes.id} IS NOT NULL THEN true ELSE false END`.as(
              "isLiked"
            ),
        })
        .from(songs)
        .leftJoin(
          songLikes,
          sql`${songLikes.songId} = ${songs.id} AND ${songLikes.userId} = ${userId}`
        )
        .orderBy(songs.uploadedAt);
    } else {
      // Basic song data for unauthenticated users
      result = await db.select().from(songs).orderBy(songs.uploadedAt);
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
};

export const getSongDetail = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const songId = parseInt(req.params.songId);
  const userId = req.user?.id;

  if (isNaN(songId)) {
    res.status(400).json({ error: "Invalid song ID" });
    return;
  }

  try {
    let result;

    if (userId) {
      // Include like status for authenticated users
      result = await db
        .select({
          id: songs.id,
          title: songs.title,
          artist: songs.artist,
          duration: songs.duration,
          fileUrl: songs.fileUrl,
          uploadedAt: songs.uploadedAt,
          isLiked:
            sql`CASE WHEN ${songLikes.id} IS NOT NULL THEN true ELSE false END`.as(
              "isLiked"
            ),
        })
        .from(songs)
        .leftJoin(
          songLikes,
          sql`${songLikes.songId} = ${songs.id} AND ${songLikes.userId} = ${userId}`
        )
        .where(eq(songs.id, songId));
    } else {
      result = await db.select().from(songs).where(eq(songs.id, songId));
    }

    if (result.length === 0) {
      res.status(404).json({ error: "Song not found" });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching song details:", error);
    res.status(500).json({ error: "Failed to fetch song details" });
  }
};

export const searchSongs = async (req: AuthenticatedRequest, res: Response) => {
  const query = req.params.q;
  const userId = req.user?.id;

  if (!query || query.length < 2) {
    res.status(400).json({ error: "Invalid search query" });
    return;
  }

  try {
    let result;

    if (userId) {
      // Include like status for authenticated users
      result = await db
        .select({
          id: songs.id,
          title: songs.title,
          artist: songs.artist,
          duration: songs.duration,
          fileUrl: songs.fileUrl,
          uploadedAt: songs.uploadedAt,
          isLiked:
            sql`CASE WHEN ${songLikes.id} IS NOT NULL THEN true ELSE false END`.as(
              "isLiked"
            ),
        })
        .from(songs)
        .leftJoin(
          songLikes,
          sql`${songLikes.songId} = ${songs.id} AND ${songLikes.userId} = ${userId}`
        )
        .where(ilike(songs.title, `%${query}%`));
    } else {
      result = await db
        .select()
        .from(songs)
        .where(ilike(songs.title, `%${query}%`));
    }

    res.json(result);
  } catch (error) {
    console.error("Error searching songs:", error);
    res.status(500).json({ error: "Failed to search songs" });
  }
};

export const searchByTitleOrArtist = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { query } = req.body;
  const userId = req.user?.id;

  if (!query || query.length < 1) {
    res.status(400).json({ error: "Query must be at least 1 character" });
    return;
  }

  try {
    let result;

    if (userId) {
      // Include like status for authenticated users
      result = await db
        .select({
          id: songs.id,
          title: songs.title,
          artist: songs.artist,
          duration: songs.duration,
          fileUrl: songs.fileUrl,
          uploadedAt: songs.uploadedAt,
          isLiked:
            sql`CASE WHEN ${songLikes.id} IS NOT NULL THEN true ELSE false END`.as(
              "isLiked"
            ),
        })
        .from(songs)
        .leftJoin(
          songLikes,
          sql`${songLikes.songId} = ${songs.id} AND ${songLikes.userId} = ${userId}`
        )
        .where(
          or(
            ilike(songs.title, `%${query}%`),
            ilike(songs.artist, `%${query}%`)
          )
        );
    } else {
      result = await db
        .select()
        .from(songs)
        .where(
          or(
            ilike(songs.title, `%${query}%`),
            ilike(songs.artist, `%${query}%`)
          )
        );
    }

    res.json(result);
  } catch (error) {
    console.error("Error searching songs:", error);
    res.status(500).json({ error: "Failed to search songs" });
  }
};

export const ingestYouTubeSong = async (req: Request, res: Response) => {
  const { title, artist, youtubeUrl } = req.body;
  const user = (req as any).user;

  if (!title || !artist || !youtubeUrl) {
    res.status(400).json({ error: "Missing input" });
    return;
  }

  audioDownloadQueue.add("download", {
    youtubeUrl,
    userId: user.username,
    title,
    artist,
  });

  res.json({ message: "Song upload added to queue" });
};

export const deleteSong = async (req: Request, res: Response) => {
  const { id, fileUrl } = req.body;
  if (!id || !fileUrl) {
    res.status(400).json({ error: "Missing ID or fileUrl" });
    return;
  }

  try {
    await deleteFromBucket(fileUrl);
    await db.delete(songs).where(eq(songs.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting song:", err);
    res.status(500).json({ error: "Failed to delete song" });
  }
};
