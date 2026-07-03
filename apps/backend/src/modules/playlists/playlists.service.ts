import { redis } from "../../lib/redis";
import { playlistsRepository, PlaylistsRepository } from "./playlists.repo";

export class PlaylistsService {
  constructor(private readonly repo: PlaylistsRepository = playlistsRepository) {}

  async createPlaylist(name: string, description: string | null, userId: number, isPublic: boolean = false) {
    if (!name || name.trim().length === 0) {
      throw new Error("Playlist name is required");
    }

    const playlist = await this.repo.createPlaylist(name.trim(), description?.trim() || null, userId, isPublic);
    
    // Invalidate playlists cache
    await redis.del(`cache:playlists:user:${userId}`);
    
    return playlist;
  }

  async getUserPlaylists(userId: number) {
    const cacheKey = `cache:playlists:user:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const userPlaylists = await this.repo.getUserPlaylists(userId);
    await redis.set(cacheKey, JSON.stringify(userPlaylists), "EX", 3600);
    return userPlaylists;
  }

  async getPlaylistById(playlistId: number, userId: number) {
    const cacheKey = `cache:playlist:${playlistId}:user:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const playlist = await this.repo.getPlaylistById(playlistId, userId);
    if (!playlist) {
      return null;
    }

    const songs = await this.repo.getPlaylistWithSongs(playlistId);
    const result = { ...playlist, songs };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);
    return result;
  }

  async addSongToPlaylist(playlistId: number, songId: number, userId: number) {
    const playlist = await this.repo.getPlaylistById(playlistId, userId);
    if (!playlist) {
      throw new Error("Playlist not found");
    }

    const existingSong = await this.repo.getSongInPlaylist(playlistId, songId);
    if (existingSong) {
      throw new Error("Song already in playlist");
    }

    await this.repo.addSongToPlaylist(playlistId, songId);
    await this.repo.updatePlaylistTimestamp(playlistId);

    // Invalidate caches
    await redis.del(`cache:playlists:user:${userId}`);
    await redis.del(`cache:playlist:${playlistId}:user:${userId}`);
  }

  async removeSongFromPlaylist(playlistId: number, songId: number, userId: number) {
    const playlist = await this.repo.getPlaylistById(playlistId, userId);
    if (!playlist) {
      throw new Error("Playlist not found");
    }

    await this.repo.removeSongFromPlaylist(playlistId, songId);
    await this.repo.updatePlaylistTimestamp(playlistId);

    // Invalidate caches
    await redis.del(`cache:playlists:user:${userId}`);
    await redis.del(`cache:playlist:${playlistId}:user:${userId}`);
  }

  async deletePlaylist(playlistId: number, userId: number) {
    const playlist = await this.repo.getPlaylistById(playlistId, userId);
    if (!playlist) {
      throw new Error("Playlist not found");
    }

    await this.repo.deletePlaylist(playlistId);

    // Invalidate caches
    await redis.del(`cache:playlists:user:${userId}`);
    await redis.del(`cache:playlist:${playlistId}:user:${userId}`);
  }

  async updatePlaylist(playlistId: number, userId: number, name?: string, description?: string, isPublic?: boolean) {
    const playlist = await this.repo.getPlaylistById(playlistId, userId);
    if (!playlist) {
      throw new Error("Playlist not found");
    }

    const updated = await this.repo.updatePlaylist(playlistId, name, description, isPublic);

    // Invalidate caches
    await redis.del(`cache:playlists:user:${userId}`);
    await redis.del(`cache:playlist:${playlistId}:user:${userId}`);

    return updated;
  }
}

export const playlistsService = new PlaylistsService();
