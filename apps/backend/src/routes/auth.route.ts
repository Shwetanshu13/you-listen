// routes/auth.route.ts
import express from "express";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { serialize } from "cookie";

import { db } from "../lib/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

import { createUser, getMe } from "../controllers/auth.controller";
import { verifyUser } from "../middleware/verifyUser";
import { verifyAdmin } from "../middleware/verifyAdmin";

const router = express.Router();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const userList = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    const user = userList[0];

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = await new SignJWT({
      id: user.id,
      username: user.username,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    res.setHeader(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    );

    res.json({
      message: "Login successful",
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/logout
router.post("/logout", (_, res) => {
  res.setHeader(
    "Set-Cookie",
    serialize("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      expires: new Date(0),
    })
  );
  res.json({ message: "Logged out" });
});

// POST /auth/create-user — only admin
router.post("/create-user", verifyAdmin, createUser);

// GET /auth/me — any logged-in user
router.get("/me", verifyUser, getMe);

export default router;
