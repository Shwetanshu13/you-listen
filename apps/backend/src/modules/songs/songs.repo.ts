import { eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../../lib/db";
import { songs, songLikes } from "../../db/schema";
import { deleteFromBucket } from "../../lib/r2";

export class SongsRepository {
  async getBaseSongs(limit: number, offset: number) {
    return await db
      .select()
      .from(songs)
      .orderBy(songs.uploadedAt)
      .limit(limit)
      .offset(offset);
  }

  async getLikedSongIdsForUser(userId: number): Promise<Set<number>> {
    try {
      const likedRecords = await db
        .select({ songId: songLikes.songId })
        .from(songLikes)
        .where(eq(songLikes.userId, userId));
      
      return new Set(likedRecords.map(r => r.songId));
    } catch (error: any) {
      if (error.code === "42P01") {
        console.log("V2 tables not found, skipping likes mapping");
        return new Set();
      }
      throw error;
    }
  }

  async getSongDetail(songId: number, userId?: number) {
    if (userId) {
      try {
        const result = await db
          .select({
            id: songs.id,
            title: songs.title,
            artist: songs.artist,
            duration: songs.duration,
            fileUrl: songs.fileUrl,
            uploadedAt: songs.uploadedAt,
            isLiked: sql`CASE WHEN ${songLikes.id} IS NOT NULL THEN true ELSE false END`.as("isLiked"),
          })
          .from(songs)
          .leftJoin(
            songLikes,
            sql`${songLikes.songId} = ${songs.id} AND ${songLikes.userId} = ${userId}`
          )
          .where(eq(songs.id, songId));
        return result;
      } catch (error: any) {
        if (error.code === "42P01") {
          console.log("V2 tables not found, falling back to basic query");
          return await db.select().from(songs).where(eq(songs.id, songId));
        }
        throw error;
      }
    } else {
      return await db.select().from(songs).where(eq(songs.id, songId));
    }
  }

  async searchSongs(query: string, limit: number, offset: number) {
    return await db
      .select()
      .from(songs)
      .where(ilike(songs.title, `%${query}%`))
      .limit(limit)
      .offset(offset);
  }

  async searchByTitleOrArtist(query: string, limit: number, offset: number) {
    return await db
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
  }

  async deleteSong(id: number, fileUrl: string) {
    await deleteFromBucket(fileUrl);
    await db.delete(songs).where(eq(songs.id, id));
  }

  async updateSong(id: number, title?: string, artist?: string) {
    const updated = await db
      .update(songs)
      .set({
        ...(title && { title }),
        ...(artist && { artist }),
      })
      .where(eq(songs.id, id))
      .returning();
    return updated;
  }
}

export const songsRepository = new SongsRepository();
