import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { users } from "../../db/schema";

export class UsersRepository {
  async getAllUsers() {
    return await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);
  }

  async deleteUser(id: number) {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUserRole(id: number, role: "admin" | "user") {
    const updated = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning({ id: users.id, username: users.username, role: users.role });
    return updated[0] || null;
  }
}

export const usersRepository = new UsersRepository();
