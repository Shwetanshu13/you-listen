import { redis } from "../../lib/redis";
import { likesRepository, LikesRepository } from "./likes.repo";

export class LikesService {
  constructor(private readonly repo: LikesRepository = likesRepository) {}

  async toggleSongLike(userId: number, songId: number) {
    const existingLike = await this.repo.getSongLike(userId, songId);

    if (existingLike) {
      await this.repo.deleteLike(userId, songId);
      await redis.del(`cache:likes:user:${userId}`);
      return { liked: false, message: "Song unliked successfully" };
    } else {
      await this.repo.insertLike(userId, songId);
      await redis.del(`cache:likes:user:${userId}`);
      return { liked: true, message: "Song liked successfully" };
    }
  }

  async getUserLikedSongs(userId: number) {
    const cacheKey = `cache:likes:user:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const likedSongs = await this.repo.getUserLikedSongs(userId);
    await redis.set(cacheKey, JSON.stringify(likedSongs), "EX", 3600);
    return likedSongs;
  }

  async checkSongLikeStatus(userId: number, songId: number) {
    const like = await this.repo.getSongLike(userId, songId);
    return {
      liked: !!like,
      likedAt: like?.likedAt || null,
    };
  }

  async getSongLikeCount(songId: number) {
    return await this.repo.getSongLikeCount(songId);
  }
}

export const likesService = new LikesService();
