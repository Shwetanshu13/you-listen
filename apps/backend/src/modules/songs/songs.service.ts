import { redis } from "../../lib/redis";
import { audioDownloadQueue } from "../../queues/audioDownloadQueue";
import { songsRepository, SongsRepository } from "./songs.repo";

export class SongsService {
  constructor(private readonly repo: SongsRepository = songsRepository) {}

  private mapLikes(baseSongs: any[], likedSongIds: Set<number>) {
    return baseSongs.map((song: any) => ({
      ...song,
      isLiked: likedSongIds.has(song.id),
    }));
  }

  async getAllSongs(limit: number, offset: number, userId?: number) {
    const cacheKey = `cache:songs:all:limit:${limit}:offset:${offset}`;
    let baseSongs;

    const cached = await redis.get(cacheKey);
    if (cached) {
      baseSongs = JSON.parse(cached);
    } else {
      baseSongs = await this.repo.getBaseSongs(limit, offset);
      await redis.set(cacheKey, JSON.stringify(baseSongs), "EX", 3600);
    }

    if (userId) {
      const likedSongIds = await this.repo.getLikedSongIdsForUser(userId);
      return this.mapLikes(baseSongs, likedSongIds);
    }

    return baseSongs;
  }

  async getSongDetail(songId: number, userId?: number) {
    const result = await this.repo.getSongDetail(songId, userId);
    return result[0];
  }

  async searchSongs(query: string, limit: number, offset: number, userId?: number) {
    const cacheKey = `cache:songs:search:q:${query}:limit:${limit}:offset:${offset}`;
    let baseSongs;

    const cached = await redis.get(cacheKey);
    if (cached) {
      baseSongs = JSON.parse(cached);
    } else {
      baseSongs = await this.repo.searchSongs(query, limit, offset);
      await redis.set(cacheKey, JSON.stringify(baseSongs), "EX", 300);
    }

    if (userId) {
      const likedSongIds = await this.repo.getLikedSongIdsForUser(userId);
      return this.mapLikes(baseSongs, likedSongIds);
    }

    return baseSongs;
  }

  async searchByTitleOrArtist(query: string, limit: number, offset: number, userId?: number) {
    const cacheKey = `cache:songs:searchAll:q:${query}:limit:${limit}:offset:${offset}`;
    let baseSongs;

    const cached = await redis.get(cacheKey);
    if (cached) {
      baseSongs = JSON.parse(cached);
    } else {
      baseSongs = await this.repo.searchByTitleOrArtist(query, limit, offset);
      await redis.set(cacheKey, JSON.stringify(baseSongs), "EX", 300);
    }

    if (userId) {
      const likedSongIds = await this.repo.getLikedSongIdsForUser(userId);
      return this.mapLikes(baseSongs, likedSongIds);
    }

    return baseSongs;
  }

  async ingestYouTubeSong(title: string, artist: string, youtubeUrl: string, username: string) {
    audioDownloadQueue.add("download", {
      youtubeUrl,
      userId: username,
      title,
      artist,
    });
  }

  async deleteSong(id: number, fileUrl: string) {
    await this.repo.deleteSong(id, fileUrl);
  }

  async updateSong(id: number, title?: string, artist?: string) {
    const updated = await this.repo.updateSong(id, title, artist);
    return updated[0] || null;
  }
}

export const songsService = new SongsService();
