import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { userPreferences } from "../../db/schema";

export class PreferencesRepository {
  async getPreferences(userId: number) {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences || null;
  }

  async createDefaultPreferences(userId: number) {
    const [newPreferences] = await db
      .insert(userPreferences)
      .values({
        userId,
        autoplay: true,
        shuffle: false,
        repeatMode: "off",
        volume: 80,
      })
      .returning();
    return newPreferences;
  }

  async updatePreferences(
    userId: number,
    updateData: Partial<{
      autoplay: boolean;
      shuffle: boolean;
      repeatMode: "off" | "one" | "all";
      volume: number;
      updatedAt: Date;
    }>
  ) {
    const [updatedPreferences] = await db
      .update(userPreferences)
      .set(updateData)
      .where(eq(userPreferences.userId, userId))
      .returning();
    return updatedPreferences;
  }

  async createPreferencesWithValues(userId: number, values: {
    autoplay: boolean;
    shuffle: boolean;
    repeatMode: "off" | "one" | "all";
    volume: number;
  }) {
    const [newPreferences] = await db
      .insert(userPreferences)
      .values({
        userId,
        ...values,
      })
      .returning();
    return newPreferences;
  }
}

export const preferencesRepository = new PreferencesRepository();
