import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { users } from "../../db/schema";

export class AuthRepository {
  async findUserByUsername(username: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return result[0] || null;
  }

  async createUser(data: typeof users.$inferInsert) {
    const result = await db.insert(users).values(data).returning();
    return result[0];
  }
}

export const authRepository = new AuthRepository();
