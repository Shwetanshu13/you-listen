import { historyRepository, HistoryRepository } from "./history.repo";

export class HistoryService {
  constructor(private readonly repo: HistoryRepository = historyRepository) {}

  async addToPlayHistory(userId: number, songId: number, playedDuration: number) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentPlay = await this.repo.getRecentPlay(userId, songId, fiveMinutesAgo);

    if (recentPlay) {
      await this.repo.updatePlayHistory(recentPlay.id, playedDuration || recentPlay.duration || 0);
      return { message: "Play history updated successfully" };
    } else {
      await this.repo.createPlayHistory(userId, songId, playedDuration || 0);
      return { message: "Added to play history successfully" };
    }
  }

  async getUserPlayHistory(userId: number, limit: number, offset: number) {
    return await this.repo.getUserPlayHistory(userId, limit, offset);
  }

  async getRecentlyPlayed(userId: number, limit: number) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return await this.repo.getRecentlyPlayed(userId, sevenDaysAgo, limit);
  }

  async getMostPlayed(userId: number, timeframe: string, limit: number) {
    let dateFilter: Date | null = null;
    const now = new Date();

    switch (timeframe) {
      case "week":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = null;
    }

    return await this.repo.getMostPlayed(userId, dateFilter, limit);
  }

  async clearPlayHistory(userId: number) {
    await this.repo.clearPlayHistory(userId);
  }
}

export const historyService = new HistoryService();
