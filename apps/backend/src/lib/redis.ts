// apps/backend/src/lib/redis.ts
import { Redis } from "ioredis";

// In production, use full Redis URL (e.g. from Upstash or Railway Redis)
// In development, fallback to localhost
export const redis = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  }
);
