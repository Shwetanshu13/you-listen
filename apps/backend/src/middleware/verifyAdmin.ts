// src/middleware/verifyAdmin.ts
import { Request, Response, NextFunction } from "express";
import { parse } from "cookie";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function verifyAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const cookies = parse(cookieHeader);
  const token = cookies.token;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = payload as {
      id: number;
      username: string;
      role: "admin" | "user";
    };

    if (user.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    (req as any).user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
}
