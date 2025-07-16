import { Worker } from "bullmq";
import IORedis from "ioredis"; // Required for Redis URL parsing
import { downloadFromYoutube } from "../lib/downloadFromYoutube";
import { db } from "../lib/db";
import { songs, ytSongIds } from "../db/schema";
import { eq } from "drizzle-orm";
import { redis } from "src/lib/redis";

// Use dotenv in dev
// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config({ path: "../../.env" });
// }

console.log(process.env.REDIS_HOST, process.env.REDIS_PORT);

const worker = new Worker(
  "audio-download",
  async (job) => {
    const { youtubeUrl, userId, title, artist } = job.data;

    const youtubeId = youtubeUrl.split("v=")[1];
    const existingSong = await db
      .select()
      .from(ytSongIds)
      .where(eq(ytSongIds.ytSongId, youtubeId));

    if (existingSong.length > 0) {
      console.log("Song already exists in DB");
      return;
    }

    const result = await downloadFromYoutube(youtubeUrl);
    if (!result.fileUrl) throw new Error("Download failed");

    await db.insert(songs).values({
      title,
      artist,
      fileUrl: result.fileUrl,
      duration: result.duration,
      addedBy: userId,
    });

    await db.insert(ytSongIds).values({ ytSongId: youtubeId });
  },
  {
    connection: redis,
  }
);

worker.on("completed", (job) => console.log(`Job ${job.id} completed!`));
worker.on("failed", (job, err) => console.error(`Job ${job?.id} failed:`, err));
