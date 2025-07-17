import Redis from "ioredis";
import { config } from "../conf/conf";

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
});
