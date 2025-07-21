// controllers/playlists.controller.ts
import { Request, Response } from "express";
import { db } from "../lib/db";
import { playlists, playlistSongs, songs } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export const createPlaylist = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { name, description, isPublic = false } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!name || name.trim().length === 0) {
    res.status(400).json({ error: "Playlist name is required" });
    return;
  }

  try {
    const [playlist] = await db
      .insert(playlists)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        userId,
        isPublic,
      })
      .returning();

    res.status(201).json(playlist);
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ error: "Failed to create playlist" });
  }
};

export const getUserPlaylists = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const userPlaylists = await db
      .select()
      .from(playlists)
      .where(eq(playlists.userId, userId))
      .orderBy(desc(playlists.updatedAt));

    res.json(userPlaylists);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
};

export const getPlaylistById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const playlistId = parseInt(req.params.id);
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (isNaN(playlistId)) {
    res.status(400).json({ error: "Invalid playlist ID" });
    return;
  }

  try {
    const [playlist] = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    // Get songs in the playlist
    const playlistWithSongs = await db
      .select({
        id: songs.id,
        title: songs.title,
        artist: songs.artist,
        duration: songs.duration,
        fileUrl: songs.fileUrl,
        order: playlistSongs.order,
        addedAt: playlistSongs.addedAt,
      })
      .from(playlistSongs)
      .innerJoin(songs, eq(playlistSongs.songId, songs.id))
      .where(eq(playlistSongs.playlistId, playlistId))
      .orderBy(playlistSongs.order);

    res.json({
      ...playlist,
      songs: playlistWithSongs,
    });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
};

export const addSongToPlaylist = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const playlistId = parseInt(req.params.id);
  const { songId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (isNaN(playlistId) || !songId) {
    res.status(400).json({ error: "Invalid playlist ID or song ID" });
    return;
  }

  try {
    // Verify playlist ownership
    const [playlist] = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    // Check if song already exists in playlist
    const [existingSong] = await db
      .select()
      .from(playlistSongs)
      .where(
        and(
          eq(playlistSongs.playlistId, playlistId),
          eq(playlistSongs.songId, songId)
        )
      );

    if (existingSong) {
      res.status(400).json({ error: "Song already in playlist" });
      return;
    }

    // Get next order number
    const [maxOrder] = await db
      .select({ maxOrder: playlistSongs.order })
      .from(playlistSongs)
      .where(eq(playlistSongs.playlistId, playlistId))
      .orderBy(desc(playlistSongs.order))
      .limit(1);

    const nextOrder = (maxOrder?.maxOrder || 0) + 1;

    // Add song to playlist
    await db.insert(playlistSongs).values({
      playlistId,
      songId,
      order: nextOrder,
    });

    // Update playlist updated timestamp
    await db
      .update(playlists)
      .set({ updatedAt: new Date() })
      .where(eq(playlists.id, playlistId));

    res.status(201).json({ message: "Song added to playlist successfully" });
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    res.status(500).json({ error: "Failed to add song to playlist" });
  }
};

export const removeSongFromPlaylist = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const playlistId = parseInt(req.params.id);
  const songId = parseInt(req.params.songId);
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (isNaN(playlistId) || isNaN(songId)) {
    res.status(400).json({ error: "Invalid playlist ID or song ID" });
    return;
  }

  try {
    // Verify playlist ownership
    const [playlist] = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    // Remove song from playlist
    await db
      .delete(playlistSongs)
      .where(
        and(
          eq(playlistSongs.playlistId, playlistId),
          eq(playlistSongs.songId, songId)
        )
      );

    // Update playlist timestamp
    await db
      .update(playlists)
      .set({ updatedAt: new Date() })
      .where(eq(playlists.id, playlistId));

    res.json({ message: "Song removed from playlist successfully" });
  } catch (error) {
    console.error("Error removing song from playlist:", error);
    res.status(500).json({ error: "Failed to remove song from playlist" });
  }
};

export const deletePlaylist = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const playlistId = parseInt(req.params.id);
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (isNaN(playlistId)) {
    res.status(400).json({ error: "Invalid playlist ID" });
    return;
  }

  try {
    // Verify playlist ownership
    const [playlist] = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    // Delete playlist songs first
    await db
      .delete(playlistSongs)
      .where(eq(playlistSongs.playlistId, playlistId));

    // Delete playlist
    await db.delete(playlists).where(eq(playlists.id, playlistId));

    res.json({ message: "Playlist deleted successfully" });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    res.status(500).json({ error: "Failed to delete playlist" });
  }
};

export const updatePlaylist = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const playlistId = parseInt(req.params.id);
  const { name, description, isPublic } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (isNaN(playlistId)) {
    res.status(400).json({ error: "Invalid playlist ID" });
    return;
  }

  try {
    // Verify playlist ownership
    const [playlist] = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    // Update playlist
    const [updatedPlaylist] = await db
      .update(playlists)
      .set({
        name: name?.trim() || playlist.name,
        description: description?.trim() || playlist.description,
        isPublic: isPublic !== undefined ? isPublic : playlist.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(playlists.id, playlistId))
      .returning();

    res.json(updatedPlaylist);
  } catch (error) {
    console.error("Error updating playlist:", error);
    res.status(500).json({ error: "Failed to update playlist" });
  }
};
