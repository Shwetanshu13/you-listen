// controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../lib/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

// POST /auth/create-user
export const createUser = async (req: Request, res: Response) => {
  const { username, password, role } = req.body;

  if (
    !username ||
    username.length < 3 ||
    !password ||
    password.length < 6 ||
    !["admin", "user"].includes(role)
  ) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (existing.length > 0) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await db
      .insert(users)
      .values({
        username,
        passwordHash: hashed,
        role,
      })
      .returning();

    res.status(201).json({ user: result[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /auth/me
export const getMe = (req: Request, res: Response) => {
  res.json((req as any).user);
};
