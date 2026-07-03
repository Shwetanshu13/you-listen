// controllers/songs.controller.ts
import { Request, Response } from "express";
import { db } from "../lib/db";
import { songs, songLikes } from "../db/schema";
import { eq, ilike, or, sql } from "drizzle-orm";
import { deleteFromBucket } from "../lib/r2";
import { audioDownloadQueue } from "../queues/audioDownloadQueue";
import { redis } from "../lib/redis";

interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export const getAllSongs = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const cacheKey = `cache:songs:all:limit:${limit}:offset:${offset}`;
    let baseSongs;

    const cached = await redis.get(cacheKey);
    if (cached) {
      baseSongs = JSON.parse(cached);
    } else {
      baseSongs = await db
        .select()
        .from(songs)
        .orderBy(songs.uploadedAt)
        .limit(limit)
        .offset(offset);
      
      // Cache for 1 hour
      await redis.set(cacheKey, JSON.stringify(baseSongs), "EX", 3600);
    }

    let result = baseSongs;

    if (userId) {
      try {
        const likedRecords = await db
          .select({ songId: songLikes.songId })
          .from(songLikes)
          .where(eq(songLikes.userId, userId));
        
        const likedSongIds = new Set(likedRecords.map(r => r.songId));
        
        result = baseSongs.map((song: any) => ({
          ...song,
          isLiked: likedSongIds.has(song.id),
        }));
      } catch (error: any) {
        if (error.code === "42P01") {
          console.log("V2 tables not found, skipping likes mapping");
        } else {
          throw error;
        }
      }
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
      try {
        // Try to include like status for authenticated users (v2 feature)
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
      } catch (error: any) {
        // Fallback to basic query if v2 tables don't exist
        if (error.code === "42P01") {
          console.log("V2 tables not found, falling back to basic query");
          result = await db.select().from(songs).where(eq(songs.id, songId));
        } else {
          throw error;
        }
      }
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

  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const cacheKey = `cache:songs:search:q:${query}:limit:${limit}:offset:${offset}`;
    let baseSongs;

    const cached = await redis.get(cacheKey);
    if (cached) {
      baseSongs = JSON.parse(cached);
    } else {
      baseSongs = await db
        .select()
        .from(songs)
        .where(ilike(songs.title, `%${query}%`))
        .limit(limit)
        .offset(offset);
      
      // Cache searches for 5 minutes
      await redis.set(cacheKey, JSON.stringify(baseSongs), "EX", 300);
    }

    let result = baseSongs;

    if (userId) {
      try {
        const likedRecords = await db
          .select({ songId: songLikes.songId })
          .from(songLikes)
          .where(eq(songLikes.userId, userId));
        
        const likedSongIds = new Set(likedRecords.map(r => r.songId));
        
        result = baseSongs.map((song: any) => ({
          ...song,
          isLiked: likedSongIds.has(song.id),
        }));
      } catch (error: any) {
        if (error.code === "42P01") {
          console.log("V2 tables not found, skipping likes mapping");
        } else {
          throw error;
        }
      }
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

  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const cacheKey = `cache:songs:searchAll:q:${query}:limit:${limit}:offset:${offset}`;
    let baseSongs;

    const cached = await redis.get(cacheKey);
    if (cached) {
      baseSongs = JSON.parse(cached);
    } else {
      baseSongs = await db
        .select()
        .from(songs)
        .where(
          or(
            ilike(songs.title, `%${query}%`),
            ilike(songs.artist, `%${query}%`)
          )
        )
        .limit(limit)
        .offset(offset);
      
      // Cache searches for 5 minutes
      await redis.set(cacheKey, JSON.stringify(baseSongs), "EX", 300);
    }

    let result = baseSongs;

    if (userId) {
      try {
        const likedRecords = await db
          .select({ songId: songLikes.songId })
          .from(songLikes)
          .where(eq(songLikes.userId, userId));
        
        const likedSongIds = new Set(likedRecords.map(r => r.songId));
        
        result = baseSongs.map((song: any) => ({
          ...song,
          isLiked: likedSongIds.has(song.id),
        }));
      } catch (error: any) {
        if (error.code === "42P01") {
          console.log("V2 tables not found, skipping likes mapping");
        } else {
          throw error;
        }
      }
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

export const updateSong = async (req: Request, res: Response) => {
  const songId = parseInt(req.params.id);
  const { title, artist } = req.body;

  if (isNaN(songId)) {
    res.status(400).json({ error: "Invalid song ID" });
    return;
  }

  try {
    const updated = await db
      .update(songs)
      .set({
        ...(title && { title }),
        ...(artist && { artist }),
      })
      .where(eq(songs.id, songId))
      .returning();

    if (updated.length === 0) {
      res.status(404).json({ error: "Song not found" });
      return;
    }

    res.json({ success: true, song: updated[0] });
  } catch (error) {
    console.error("Error updating song:", error);
    res.status(500).json({ error: "Failed to update song" });
  }
};
