// src/middleware/verifyUser.ts
import { Request, Response, NextFunction } from "express";
import { parse } from "cookie";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function verifyUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const cookieHeader = req.headers.cookie;
  // console.log(req.headers);
  console.log(cookieHeader);

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
    (req as any).user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
}
