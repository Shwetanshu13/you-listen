import { eq, and, desc } from "drizzle-orm";
import { db } from "../../lib/db";
import { playlists, playlistSongs, songs } from "../../db/schema";

export class PlaylistsRepository {
  async createPlaylist(name: string, description: string | null, userId: number, isPublic: boolean) {
    const [playlist] = await db
      .insert(playlists)
      .values({
        name,
        description,
        userId,
        isPublic,
      })
      .returning();
    return playlist;
  }

  async getUserPlaylists(userId: number) {
    return await db
      .select()
      .from(playlists)
      .where(eq(playlists.userId, userId))
      .orderBy(desc(playlists.updatedAt));
  }

  async getPlaylistById(playlistId: number, userId: number) {
    const [playlist] = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));
    return playlist || null;
  }

  async getPlaylistWithSongs(playlistId: number) {
    return await db
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
  }

  async getSongInPlaylist(playlistId: number, songId: number) {
    const [existingSong] = await db
      .select()
      .from(playlistSongs)
      .where(
        and(
          eq(playlistSongs.playlistId, playlistId),
          eq(playlistSongs.songId, songId)
        )
      );
    return existingSong || null;
  }

  async addSongToPlaylist(playlistId: number, songId: number) {
    const [maxOrder] = await db
      .select({ maxOrder: playlistSongs.order })
      .from(playlistSongs)
      .where(eq(playlistSongs.playlistId, playlistId))
      .orderBy(desc(playlistSongs.order))
      .limit(1);

    const nextOrder = (maxOrder?.maxOrder || 0) + 1;

    await db.insert(playlistSongs).values({
      playlistId,
      songId,
      order: nextOrder,
    });
  }

  async updatePlaylistTimestamp(playlistId: number) {
    await db
      .update(playlists)
      .set({ updatedAt: new Date() })
      .where(eq(playlists.id, playlistId));
  }

  async removeSongFromPlaylist(playlistId: number, songId: number) {
    await db
      .delete(playlistSongs)
      .where(
        and(
          eq(playlistSongs.playlistId, playlistId),
          eq(playlistSongs.songId, songId)
        )
      );
  }

  async deletePlaylist(playlistId: number) {
    await db.delete(playlistSongs).where(eq(playlistSongs.playlistId, playlistId));
    await db.delete(playlists).where(eq(playlists.id, playlistId));
  }

  async updatePlaylist(playlistId: number, name?: string, description?: string, isPublic?: boolean) {
    const [playlist] = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, playlistId));

    if (!playlist) return null;

    const [updatedPlaylist] = await db
      .update(playlists)
      .set({
        name: name?.trim() || playlist.name,
        description: description !== undefined ? description?.trim() : playlist.description,
        isPublic: isPublic !== undefined ? isPublic : playlist.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(playlists.id, playlistId))
      .returning();

    return updatedPlaylist;
  }
}

export const playlistsRepository = new PlaylistsRepository();
