import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../../lib/db";
import { playHistory, songs } from "../../db/schema";

export class HistoryRepository {
  async getRecentPlay(userId: number, songId: number, fiveMinutesAgo: Date) {
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
    return recentPlay || null;
  }

  async updatePlayHistory(id: number, duration: number) {
    await db
      .update(playHistory)
      .set({
        playedAt: new Date(),
        duration,
      })
      .where(eq(playHistory.id, id));
  }

  async createPlayHistory(userId: number, songId: number, duration: number) {
    await db.insert(playHistory).values({
      userId,
      songId,
      duration,
    });
  }

  async getUserPlayHistory(userId: number, limit: number, offset: number) {
    return await db
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
  }

  async getRecentlyPlayed(userId: number, sevenDaysAgo: Date, limit: number) {
    return await db
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
  }

  async getMostPlayed(userId: number, dateFilter: Date | null, limit: number) {
    const whereCondition = dateFilter
      ? and(
          eq(playHistory.userId, userId),
          sql`${playHistory.playedAt} > ${dateFilter}`
        )
      : eq(playHistory.userId, userId);

    return await db
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
  }

  async clearPlayHistory(userId: number) {
    await db.delete(playHistory).where(eq(playHistory.userId, userId));
  }
}

export const historyRepository = new HistoryRepository();
