import { Request, Response } from "express";
import { db } from "../lib/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);
    res.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    await db.delete(users).where(eq(users.id, userId));
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { role } = req.body;

  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  if (!["admin", "user"].includes(role)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }

  try {
    const updated = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning({ id: users.id, username: users.username, role: users.role });

    if (updated.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ success: true, user: updated[0] });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
};
