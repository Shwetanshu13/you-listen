// apps/backend/src/context.ts
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
// import dotenv from "dotenv";
import { parse } from "cookie";
import { jwtVerify } from "jose";

// dotenv.config({ path: "../../.env" });

export type JWTPayload = {
  id: number;
  username: string;
  role: "admin" | "user";
};

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export const createContext = async ({
  req,
}: CreateExpressContextOptions): Promise<{ user: JWTPayload | null }> => {
  const cookies = req.headers.cookie;
  let user: JWTPayload | null = null;

  if (cookies) {
    const parsed = parse(cookies);
    const token = parsed.token;

    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        user = payload as JWTPayload;
      } catch (err) {
        console.warn("Invalid JWT in cookie", err);
      }
    }
  }
  console.log("Context created with user:", user);
  return { user };
};
