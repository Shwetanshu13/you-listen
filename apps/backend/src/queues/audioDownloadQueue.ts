// apps/backend/src/lib/queues/youtubeQueue.ts
import { Queue } from "bullmq";
import { redis } from "../lib/redis";

export const audioDownloadQueue = new Queue("audio-download", {
  connection: redis,
});
