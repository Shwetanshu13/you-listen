// controllers/songs.controller.ts
import { Request, Response } from "express";
import { db } from "../lib/db";
import { songs } from "../db/schema";
import { eq, ilike, or } from "drizzle-orm";
import { deleteFromBucket } from "../lib/r2";
import { audioDownloadQueue } from "../queues/audioDownloadQueue";

export const getAllSongs = async (_: Request, res: Response) => {
  const result = await db.select().from(songs).orderBy(songs.uploadedAt);
  res.json(result);
};

export const getSongDetail = async (req: Request, res: Response) => {
  const songId = parseInt(req.params.songId);

  if (isNaN(songId)) {
    res.status(400).json({ error: "Invalid song ID" });
    return;
  }

  try {
    const result = await db.select().from(songs).where(eq(songs.id, songId));

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

export const searchSongs = async (req: Request, res: Response) => {
  const query = req.params.q;
  if (!query || query.length < 2) {
    res.status(400).json({ error: "Invalid search query" });
    return;
  }

  const result = await db
    .select()
    .from(songs)
    .where(ilike(songs.title, `%${query}%`));

  res.json(result);
};

export const searchByTitleOrArtist = async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query || query.length < 1) {
    res.status(400).json({ error: "Query must be at least 1 character" });
    return;
  }

  const result = await db
    .select()
    .from(songs)
    .where(
      or(ilike(songs.title, `%${query}%`), ilike(songs.artist, `%${query}%`))
    );

  res.json(result);
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
