import Redis from "ioredis";

let redis: Redis | undefined;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
  });
}
export { redis };
