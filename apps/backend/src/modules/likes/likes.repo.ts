import { eq, and, desc } from "drizzle-orm";
import { db } from "../../lib/db";
import { songLikes, songs } from "../../db/schema";

export class LikesRepository {
  async getSongLike(userId: number, songId: number) {
    const [like] = await db
      .select()
      .from(songLikes)
      .where(and(eq(songLikes.userId, userId), eq(songLikes.songId, songId)));
    return like || null;
  }

  async deleteLike(userId: number, songId: number) {
    await db
      .delete(songLikes)
      .where(and(eq(songLikes.userId, userId), eq(songLikes.songId, songId)));
  }

  async insertLike(userId: number, songId: number) {
    await db.insert(songLikes).values({
      userId,
      songId,
    });
  }

  async getUserLikedSongs(userId: number) {
    return await db
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
  }

  async getSongLikeCount(songId: number) {
    const [result] = await db
      .select({ count: songLikes.id })
      .from(songLikes)
      .where(eq(songLikes.songId, songId));
    return result?.count || 0;
  }
}

export const likesRepository = new LikesRepository();
