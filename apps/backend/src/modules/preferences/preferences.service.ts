import { preferencesRepository, PreferencesRepository } from "./preferences.repo";

export class PreferencesService {
  constructor(private readonly repo: PreferencesRepository = preferencesRepository) {}

  async getUserPreferences(userId: number) {
    const preferences = await this.repo.getPreferences(userId);
    if (!preferences) {
      return await this.repo.createDefaultPreferences(userId);
    }
    return preferences;
  }

  async updateUserPreferences(
    userId: number,
    autoplay?: boolean,
    shuffle?: boolean,
    repeatMode?: string,
    volume?: number
  ) {
    const existingPreferences = await this.repo.getPreferences(userId);

    const updateData: any = { updatedAt: new Date() };

    if (autoplay !== undefined) updateData.autoplay = autoplay;
    if (shuffle !== undefined) updateData.shuffle = shuffle;
    if (repeatMode !== undefined) {
      if (["off", "one", "all"].includes(repeatMode)) {
        updateData.repeatMode = repeatMode;
      } else {
        throw new Error("Invalid repeat mode. Must be 'off', 'one', or 'all'");
      }
    }
    if (volume !== undefined) {
      if (volume >= 0 && volume <= 100) {
        updateData.volume = volume;
      } else {
        throw new Error("Volume must be between 0 and 100");
      }
    }

    if (existingPreferences) {
      return await this.repo.updatePreferences(userId, updateData);
    } else {
      return await this.repo.createPreferencesWithValues(userId, {
        autoplay: autoplay ?? true,
        shuffle: shuffle ?? false,
        repeatMode: (repeatMode as "off" | "one" | "all") ?? "off",
        volume: volume ?? 80,
      });
    }
  }

  async resetUserPreferences(userId: number) {
    const resetData = {
      autoplay: true,
      shuffle: false,
      repeatMode: "off" as const,
      volume: 80,
      updatedAt: new Date(),
    };

    const resetPreferences = await this.repo.updatePreferences(userId, resetData);

    if (!resetPreferences) {
      return await this.repo.createDefaultPreferences(userId);
    }
    
    return resetPreferences;
  }
}

export const preferencesService = new PreferencesService();
